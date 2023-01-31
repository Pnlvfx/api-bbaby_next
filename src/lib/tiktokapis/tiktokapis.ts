import { catchError } from '../../coraline/cor-route/crlerror';
import coraline from '../../coraline/coraline';
import ffmpeg from '../ffmpeg/ffmpeg';
import googleapis from '../googleapis/googleapis';
import tiktokquora from './route/tiktokquora';
import pexelsapi from '../pexelsapi/pexelsapi';
import * as TextToImage from 'text-to-image';
import util from 'util';
import fs from 'fs';
import { TiktakProps } from '../../models/types/tiktak';
import path from 'path';

// const getPexelsVideosBySize = (videos: PexelsVideo[], width: number, height: number) => {
//   let videoSource: PexelsVideo['video_files'] = [];
//   videos.map((video) => {
//     const videoFiles = video.video_files;
//     const filtered2 = videoFiles.filter((file) => file.width === width && file.height === height);
//     if (filtered2.length === 0) return;
//     videoSource = filtered2;
//   });
//   return videoSource;
// };

const findClosestVideoSize = (width: number, height: number, videoFiles: PexelsVideo['video_files']) => {
  let closest = videoFiles[0];
  let closestDiff = Number.MAX_SAFE_INTEGER;
  for (const file of videoFiles) {
    const diff = Math.abs(file.width - width) + Math.abs(file.height - height);
    if (diff < closestDiff) {
      closest = file;
      closestDiff = diff;
    }
  }
  return closest;
};

type Selected = {
  video: PexelsVideo;
  duration: number;
};

const getPexelsVideo = async (synthetize: string, output: string, min_duration: number, width: number, height: number) => {
  try {
    const orientation = width >= 1920 ? 'landscape' : 'portrait';
    const pexelsVideos = await pexelsapi.getVideo(synthetize, { per_page: 80, orientation });
    if (pexelsVideos.length === 0) throw new Error('pexels research return 00 videos');
    pexelsVideos.sort((a, b) => b.duration - a.duration);
    const selected: Selected[] = [];
    let current = 0;
    pexelsVideos.map((video) => {
      if (current > min_duration) return;
      selected.push({ video, duration: video.duration });
      current += video.duration;
    });
    const sources = selected.map((select) => {
      return findClosestVideoSize(width, height, select.video.video_files);
    });
    const folder = path.dirname(output);
    const backgroundVideos = await Promise.all(
      sources.map(async (source, index) => {
        const sourceOutput = `${folder}/video_${index}.mp4`;
        const backgroundVideo = await pexelsapi.downloadVideo(source.link, sourceOutput);
        return backgroundVideo;
      }),
    );
    const backgroundVideo = await ffmpeg.concatenateVideos(backgroundVideos, width, height, output);
    return backgroundVideo;
    // console.log(pexelsVideos[0])
    // const filtered1 = pexelsVideos.filter((video) => video.duration > min_duration)
    // console.log({filtered1: filtered1.length})
    // if (filtered1.length === 0) throw new Error('pexels research return 000 videos');
    // const videoSource = getPexelsVideosBySize(filtered1, width, height)
    // console.log({videoSource: videoSource.length})
    // if (videoSource.length === 0) throw new Error('pexels research return 0000 videos');
    // const backgroundVideo = await pexelsapi.downloadVideo(videoSource[0].link, output);
    // return backgroundVideo;
  } catch (err) {
    throw catchError(err);
  }
};

const tiktokapis = {
  // createVideo: async (fileId: string, uniqueFileId: string) => {
  //   try {
  //     const folder = coraline.use('lib/telegram');
  //     const video = await telegramapis.downloadFile(fileId, (ext) => {
  //       return `${folder}/${uniqueFileId}.${ext}`;
  //     });
  //     await coraline.wait(2000);
  //     const path = coraline.use('lib/telegram');
  //     //const output = `${path}/${fileId.substring(0, 10)}.flac`;
  //     const audio = `${path}/BAACAgQAAx.flac`;
  //     //const audio = await ffmpeg.videoToAudio(video, output);
  //     console.log('speech to text started');
  //     const text = await googleapis.speechToText(audio);
  //     console.log('speech to text ended', 'text length:', text.join('').length);
  //     const translated = await googleapis.translate(text.join(''), 'en', 'it');
  //     //await telegramapis.sendMessage(apiconfig.telegram.my_chat_id, translated as string)
  //     console.log(translated);
  //   } catch (err) {
  //     console.log(err, 'tiktokAPIS');
  //   }
  // },
  quoraVideo: async (tiktak: TiktakProps, width: number, height: number) => {
    try {
      const folder = coraline.useStatic(`tiktak/${tiktak._id}`);
      const audio_path = `${folder}/audio_final.mp3`;
      const pitch = -8;
      const full_audio = await googleapis.textToSpeech(tiktak.body, pitch);
      tiktak.audio = await coraline.media.saveAudio(full_audio.audioContent, audio_path);
      tiktak.duration = await ffmpeg.getDuration(audio_path);
      const backgroundPath = `${folder}/background_video.mp4`;
      const backgroundVideo = await getPexelsVideo(tiktak.synthetize, backgroundPath, tiktak.duration, width, height);
      tiktak.background_video = coraline.media.getUrlFromPath(backgroundPath);
      const textArray = tiktokquora.splitText(tiktak.body, 150);
      const bgColor = 'rgba(0,0,0,0.25';
      const textColor = coraline.colors.getDarkColor();
      const images: FFmpegImage[] = [];
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
              textColor,
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
      throw catchError(err);
    }
  },
};

export default tiktokapis;
