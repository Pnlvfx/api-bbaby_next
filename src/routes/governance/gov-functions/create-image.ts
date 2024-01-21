import fs from 'node:fs';
import * as TextToImage from 'text-to-image';
import util from 'node:util';
import { NewsProps } from '../../../@types/news';
import googleapis from '../../../lib/googleapis/googleapis';
import sharp from 'sharp';
import ffmpeg from '../../../lib/ffmpeg/ffmpeg';
import coraline from 'coraline';

const getFormat = (news: NewsProps) => {
  if (!news.mediaInfo.image) throw new Error('Missing image!');
  const split = news.mediaInfo.image.split('?')[0].split('.');
  return split.at(-1);
};

const overlayImage = async (overlayImage: string, backgroundImage: string, destination: string) => {
  await sharp(backgroundImage)
    .composite([{ input: overlayImage }])
    .toFile(destination);
  return destination;
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
};

export const createAudio = async (input: string, audio: Array<string>, audioPath: string) => {
  const data = await googleapis.textToSpeech(input);
  await coraline.media.saveAudio(data.audioContent, audioPath);
  audio.push(audioPath);
  return ffmpeg.getDuration(audioPath);
};
