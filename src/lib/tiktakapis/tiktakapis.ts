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
    if (!tiktak.synthetize) throw new Error('Missing synthetize parameter!');
    const folder = coraline.useStatic(`tiktak/${tiktak._id}`);
    const audio_path = `${folder}/audio_final.mp3`;
    console.log('Converting text to speech');
    const full_audio = await googleapis.textToSpeech(`${tiktak.title} \n ${tiktak.body}`, pitch);
    tiktak.audio = await coraline.media.saveAudio(full_audio.audioContent, audio_path);
    tiktak.duration = await ffmpeg.getDuration(audio_path);
    const backgroundVideo = await getPexelsVideo(tiktak.synthetize, `${folder}/background_video.mp4`, tiktak.duration, width, height);
    tiktak.background_video = coraline.media.getUrlFromPath(backgroundVideo);
    await tiktak.save();
    return tiktak;
  },
  finalVideo: async (tiktak: TiktakProps, width: number, height: number, textColor: string) => {
    if (!tiktak.background_video) throw new Error('Missing background_video attribute');
    if (!tiktak.duration) throw new Error('Missing video duration attribute');
    const bgColor = 'rgba(0,0,0,0.25';
    const textArray = splitText(tiktak.body, 85);
    textArray.unshift(tiktak.title);
    const folder = coraline.useStatic(`tiktak/${tiktak._id}`);
    const audio_path = `${folder}/audio_final.mp3`;
    const images: { path: string; loop: number }[] = [];
    for (let i = 0; i < textArray.length; i++) {
      await coraline.wait(i * 2000);
      const audio = await googleapis.textToSpeech(textArray[i], pitch);
      const audioPath = `${folder}/audio_${i}.mp3`;
      await coraline.media.saveAudio(audio.audioContent, audioPath);
      const duration = await ffmpeg.getDuration(audioPath);
      const textData = await TextToImage.generate(textArray[i], {
        maxWidth: width,
        margin: 30,
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
      const overlayPath = `${folder}/overlay${i}.png`;
      const writeFile = util.promisify(fs.writeFile);
      await writeFile(overlayPath, imageOverlay, 'binary');
      images.push({ path: overlayPath, loop: duration - 0.35 });
      await coraline.deleteFile(audioPath);
    }
    let total = 0;
    images.map((image) => {
      total += image.loop;
    });
    console.log({ duration: tiktak.duration, total });
    const final_path = `${folder}/final_video.mp4`;
    await ffmpeg.overlayImagesToVideo(images, tiktak.background_video, audio_path, final_path, tiktak.duration);
    tiktak.video = coraline.media.getUrlFromPath(final_path);
    await tiktak.save();
    for (const image of images) {
      await coraline.deleteFile(image.path);
    }
    return tiktak;
  },
};

export default tiktakapis;
