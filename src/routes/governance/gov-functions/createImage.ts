import fs from 'fs';
import * as TextToImage from 'text-to-image';
import util from 'util';
import coraline from '../../../coraline/coraline';
import { NewsProps } from '../../../@types/news';
import googleapis from '../../../lib/googleapis/googleapis';
import sharp from 'sharp';
import { catchError } from '../../../coraline/cor-route/crlerror';
import ffmpeg from '../../../lib/ffmpeg/ffmpeg';

const getFormat = (news: NewsProps) => {
  if (!news.mediaInfo.image) throw new Error('Missing image!');
  const split = news.mediaInfo.image.split('?')[0].split('.');
  const format = split[split.length - 1];
  return format;
};

const overlayImage = async (overlayImage: string, backgroundImage: string, destination: string) => {
  try {
    await sharp(backgroundImage)
      .composite([{ input: overlayImage }])
      .toFile(destination);
    return destination;
  } catch (err) {
    throw catchError(err);
  }
};

export const _createImage = async (
  input: string,
  news: NewsProps,
  textColor: string,
  width: number,
  height: number,
  fontSize: number,
  index: number,
) => {
  try {
    const bgColor = 'rgba(0,0,0,0';
    const textData = await TextToImage.generate(input, {
      maxWidth: width,
      bgColor,
      textColor,
      fontFamily: 'Helvetica',
      customHeight: height,
      fontSize,
      lineHeight: fontSize,
      textAlign: 'center',
      verticalAlign: 'center',
    });
    const data = textData.replace(/^data:image\/\w+;base64,/, '');
    const imageOverlay = Buffer.from(data, 'base64');
    const folder = coraline.useStatic(`youtube`);
    const overlayPath = `${folder}/overlay${index}.png`;
    const writeFile = util.promisify(fs.writeFile);
    await writeFile(overlayPath, imageOverlay, 'binary');
    const path = coraline.use('images');
    const format = getFormat(news);
    const bgImage = `${path}/news/${news._id.toString()}_1920x1080.${format}`;
    const imagePath = `${folder}/image${index}.png`;
    const filename = await overlayImage(overlayPath, bgImage, imagePath);
    const url = coraline.media.getUrlFromPath(filename);
    return { url, filename };
  } catch (err) {
    throw catchError(err);
  }
};

export const createAudio = async (input: string, audio: Array<string>, audioPath: string) => {
  try {
    const data = await googleapis.textToSpeech(input);
    await coraline.media.saveAudio(data.audioContent, audioPath);
    audio.push(audioPath);
    const audioDuration = await ffmpeg.getDuration(audioPath);
    return audioDuration;
  } catch (err) {
    throw catchError(err);
  }
};
