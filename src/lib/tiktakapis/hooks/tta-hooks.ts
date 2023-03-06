import { catchError } from '../../../coraline/cor-route/crlerror';
import ffmpeg from '../../ffmpeg/ffmpeg';
import pexelsapi from '../../pexelsapi/pexelsapi';
import path from 'path';

type Selected = {
  video: PexelsVideo;
  duration: number;
};

export const splitText = (text: string, max: number) => {
  const textArray = text.split(' ');
  const parts = [];
  let part = '';
  for (let i = 0; i < textArray.length; i++) {
    if (part.length + textArray[i].length + 1 <= max) {
      part += textArray[i] + ' ';
    } else {
      parts.push(part);
      part = textArray[i] + ' ';
    }
  }
  parts.push(part);
  return parts;
};

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

export const getPexelsVideo = async (synthetize: string, output: string, min_duration: number, width: number, height: number) => {
  try {
    const orientation = width >= 1920 ? 'landscape' : 'portrait';
    const pexelsVideos = await pexelsapi.getVideo(synthetize, { per_page: 80, orientation });
    if (pexelsVideos.length === 0) throw new Error('We cannot find valid videos with this settings!');
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
        return {
          backgroundVideo,
          width: source.width,
          height: source.height,
        };
      }),
    );
    await Promise.all(
      backgroundVideos.map(async (bgvideo) => {
        try {
          if (bgvideo.height !== height || bgvideo.width !== width) {
            const out = bgvideo.backgroundVideo.split('.')[0];
            const output = `${out}_resized.mp4`;
            const resized = await ffmpeg.resizeVideo(bgvideo.backgroundVideo, width, height, output);
            bgvideo.backgroundVideo = resized;
          }
        } catch (err) {
          throw catchError(err);
        }
      }),
    );
    let backgroundVideo;
    if (backgroundVideos.length > 1) {
      const bgArray = backgroundVideos.map((bg) => bg.backgroundVideo);
      backgroundVideo = await ffmpeg.concatenateVideos(bgArray, width, height, output);
    } else {
      backgroundVideo = backgroundVideos[0].backgroundVideo;
    }
    return backgroundVideo;
  } catch (err) {
    throw catchError(err);
  }
};
