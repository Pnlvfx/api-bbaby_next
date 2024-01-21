import coraline from 'coraline';
import ffmpeg from '../ffmpeg/ffmpeg';
import speechtotext from '../googleapis/route/speechtotext';

const tiktokapis = {
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
      const tiktok = (await coraline.readJSON(filename)) as Tiktok;
      await coraline.deleteFile(tiktok.video.filename);
      await coraline.deleteFile(filename);
    } catch (err) {
      throw catchError(err);
    }
  },
};

export default tiktokapis;
