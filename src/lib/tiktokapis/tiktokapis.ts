import { catchError } from '../../coraline/cor-route/crlerror';
import coraline from '../../coraline/coraline';
import ffmpeg from '../ffmpeg/ffmpeg';
import speechtotext from '../googleapis/route/speechtotext';
import { getInfo } from './hooks/tt-info';

const tiktokapis = {
  getVideoID: (url: string) => {
    const split = url.split('/');
    return split[split.length - 1];
  },
  getInfo,
  directDownload: async (url: string, output: string) => {
    try {
      try {
        const response = await coraline.readJSON(output);
        return response as TiktokProps;
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
        return response as TiktokProps;
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
      const text = await speechtotext.recognize(audio, 'en-US');
      return text.join(' ');
    } catch (err) {
      throw catchError(err);
    }
  },
  deleteTiktok: async (filename: string) => {
    try {
      const tiktok = (await coraline.readJSON(filename)) as TiktokProps;
      await coraline.deleteFile(tiktok.video.filename);
      await coraline.deleteFile(filename);
    } catch (err) {
      throw catchError(err);
    }
  },
};

export default tiktokapis;
