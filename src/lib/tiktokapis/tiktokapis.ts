import { catchError } from '../../coraline/cor-route/crlerror';
import coraline from '../../coraline/coraline';
import ffmpeg from '../ffmpeg/ffmpeg';
import googleapis from '../googleapis/googleapis';
import { getInfo } from './hooks/ttInfo';

const tiktokapis = {
  getVideoID: (url: string) => {
    const split = url.split('/');
    return split[split.length - 1];
  },
  downloadVideo: async (url: string, output: string) => {
    try {
      try {
        const response = await coraline.readJSON(output);
        return response as DownloadReponse;
      } catch (err) {
        const info = await getInfo(url);
        if (!info.video.url.no_wm) throw new Error('Missing video for this url!');
        const id = tiktokapis.getVideoID(url);
        const publicID = `tiktok/${id}`;
        const video = await coraline.media.getMediaFromUrl(info.video.url.no_wm, publicID, 'videos');
        const response = {
          id,
          video,
        };
        await coraline.saveFile(output, response);
        return response as DownloadReponse;
      }
    } catch (err) {
      throw catchError(err);
    }
  },
  extractText: async (video: string, id: string) => {
    try {
      const path = coraline.use('tiktok');
      const filename = `${path}/${id}_original.flac`;
      const audio = await ffmpeg.videoToAudio(video, filename);
      const text = await googleapis.speechToText(audio);
      return text.join(' ');
    } catch (err) {
      throw catchError(err);
    }
  },
};

export default tiktokapis;
