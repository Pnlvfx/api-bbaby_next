import { catchError } from '../../coraline/cor-route/crlerror';
import coraline from '../../coraline/coraline';
import ffmpeg from '../ffmpeg/ffmpeg';
import googleapis from '../googleapis/googleapis';
import telegramapis from '../telegramapis/telegramapis';
import tiktokquora from './route/tiktokquora';
import openaiapis from '../openaiapis/openaiapis';
import pexelsapi from '../pexelsapi/pexelsapi';
import * as TextToImage from 'text-to-image';
import util from 'util';
import fs from 'fs';
import { catchErrorWithTelegram } from '../../config/common';
import { TiktakProps } from '../../models/types/tiktak';

const getPexelsVideo = async (text: string, output: string, min_duration: number, width: number, height: number) => {
  try {
    const synthetize = await openaiapis.synthetize(text);
    console.log({synthetize});
    const orientation = width >= 1920 ? 'landscape' : 'portrait'
    const pexelsVideo = await pexelsapi.getVideo(synthetize, {per_page: 80, orientation});
    console.log({pexelsVideo: pexelsVideo.length, min_duration});
    if (pexelsVideo.length === 0) throw new Error('pexels research return 00 videos');
    const filtered1 = pexelsVideo.filter((video) => video.duration > min_duration)
    console.log({filtered1: filtered1.length})
    if (filtered1.length === 0) throw new Error('pexels research return 000 videos');
    let videoSource: PexelsVideo['video_files'] = []
    filtered1.map((video) => {
      const videoFiles = video.video_files;
      const filtered2 = videoFiles.filter((file) => file.width === width && file.height === height);
      if (filtered2.length === 0) return;
      videoSource = filtered2
    })
    console.log({videoSource: videoSource.length})
    if (videoSource.length === 0) throw new Error('pexels research return 0000 videos');
    const backgroundVideo = await pexelsapi.downloadVideo(videoSource[0].link, output);
    return backgroundVideo;
  } catch (err) {
    throw catchError(err);
  }
};

const tiktokapis = {
  createVideo: async (fileId: string, uniqueFileId: string) => {
    try {
      console.log('tiktok started');
      const folder = coraline.use('lib/telegram');
      const video = await telegramapis.downloadFile(fileId, (ext) => {
        return `${folder}/${uniqueFileId}.${ext}`;
      });
      await coraline.wait(2000);
      const path = coraline.use('lib/telegram');
      //const output = `${path}/${fileId.substring(0, 10)}.flac`;
      const audio = `${path}/BAACAgQAAx.flac`;
      //const audio = await ffmpeg.videoToAudio(video, output);
      console.log('speech to text started');
      const text = await googleapis.speechToText(audio);
      console.log('speech to text ended', 'text length:', text.join('').length);
      const translated = await googleapis.translate(text.join(''), 'en', 'it');
      //await telegramapis.sendMessage(apiconfig.telegram.my_chat_id, translated as string)
      console.log(translated);
    } catch (err) {
      console.log(err, 'tiktokAPIS');
    }
  },
  quoraVideo: async (tiktak: TiktakProps, width: number, height: number) => {
    try {
      const pitch = -8;
      const folder = coraline.useStatic(`tiktak/${tiktak._id}`);
      const audio_path = `${folder}/audio_final.mp3`;
      const full_audio = await googleapis.textToSpeech(tiktak.body, pitch);
      tiktak.audio =  await coraline.media.saveAudio(full_audio.audioContent, audio_path);
      tiktak.duration = await ffmpeg.getDuration(audio_path);
      const backgroundPath = `${folder}/background_video.mp4`
      const backgroundVideo = await getPexelsVideo(tiktak.body, backgroundPath, tiktak.duration, width, height);
      tiktak.background_video = coraline.media.getUrlFromPath(backgroundPath);
      const textArray = tiktokquora.splitText(tiktak.body, 150);
      const bgColor = 'rgba(0,0,0,0';
      let images: FFmpegImage[] = [];
      await Promise.all(
        textArray.map(async (text, index) => {
          try {
            await coraline.wait(index * 2000);
            const audio = await googleapis.textToSpeech(text, pitch);
            const audioPath = `${folder}/audio_${index}.mp3`;
            const audioUrl = await coraline.media.saveAudio(audio.audioContent, audioPath);
            tiktak.audios.push(audioUrl);
            const duration = await ffmpeg.getDuration(audioPath);
            const textData = await TextToImage.generate(text, {
              maxWidth: width,
              bgColor,
              textColor: 'white',
              fontFamily: 'Helvetica',
              customHeight: height,
              fontSize: 72,
              lineHeight: 72,
              textAlign: 'center',
              verticalAlign: 'center',
            });
            const data = textData.replace(/^data:image\/\w+;base64,/, '');
            const imageOverlay = Buffer.from(data, 'base64');
            const overlayPath = `${folder}/overlay${index}.png`;
            const writeFile = util.promisify(fs.writeFile);
            await writeFile(overlayPath, imageOverlay, 'binary');
            images.push({ path: overlayPath, loop: duration - 0.5 });
          } catch (err) {
            throw catchError(err);
          }
        }),
      );
      tiktak.images = images;
      const final_path = `${folder}/final_video.mp4`;
      await ffmpeg.overlayImageToVideo(images, backgroundVideo, audio_path, final_path, tiktak.duration);
      tiktak.video = coraline.media.getUrlFromPath(final_path);
      await tiktak.save();
      return tiktak;
    } catch (err) {
      catchErrorWithTelegram(err);
    }
  },
};

export default tiktokapis;
