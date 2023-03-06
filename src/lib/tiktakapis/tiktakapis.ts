import { catchError } from '../../coraline/cor-route/crlerror';
import coraline from '../../coraline/coraline';
import ffmpeg from '../ffmpeg/ffmpeg';
import googleapis from '../googleapis/googleapis';
import * as TextToImage from 'text-to-image';
import util from 'util';
import fs from 'fs';
import { TiktakProps } from '../../models/types/tiktak';
import { getPexelsVideo, splitText } from './hooks/tta-hooks';
const pitch = -8;

const tiktakapis = {
  backgroundVideo: async (tiktak: TiktakProps, width: number, height: number) => {
    try {
      const folder = coraline.useStatic(`tiktak/${tiktak._id}`);
      const audio_path = `${folder}/audio_final.mp3`;
      const full_audio = await googleapis.textToSpeech(`${tiktak.title} \n ${tiktak.body}`, pitch);
      tiktak.audio = await coraline.media.saveAudio(full_audio.audioContent, audio_path);
      tiktak.duration = await ffmpeg.getDuration(audio_path);
      if (!tiktak.synthetize) throw new Error('Missing synthetize parameter!');
      const backgroundVideo = await getPexelsVideo(tiktak.synthetize, `${folder}/background_video.mp4`, tiktak.duration, width, height);
      tiktak.background_video = coraline.media.getUrlFromPath(backgroundVideo);
      await tiktak.save();
      return tiktak;
    } catch (err) {
      throw catchError(err);
    }
  },
  finalVideo: async (tiktak: TiktakProps, width: number, height: number, textColor: string) => {
    try {
      if (!tiktak.background_video) throw new Error('Missing background_video attribute');
      if (!tiktak.duration) throw new Error('Missing video duration attribute');
      const bgColor = 'rgba(0,0,0,0.25';
      const textArray = splitText(tiktak.body, 75);
      textArray.unshift(tiktak.title);
      const folder = coraline.useStatic(`tiktak/${tiktak._id}`);
      const audio_path = `${folder}/audio_final.mp3`;
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
              maxWidth: width - 60,
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
            tiktak.images.push({ path: overlayPath, loop: duration - 0.5 });
          } catch (err) {
            throw catchError(err);
          }
        }),
      );
      const final_path = `${folder}/final_video.mp4`;
      await ffmpeg.overlayImageToVideo(tiktak.images, tiktak.background_video, audio_path, final_path, tiktak.duration);
      tiktak.video = coraline.media.getUrlFromPath(final_path);
      await tiktak.save();
      return tiktak;
    } catch (err) {
      throw catchError(err);
    }
  },
};

export default tiktakapis;
