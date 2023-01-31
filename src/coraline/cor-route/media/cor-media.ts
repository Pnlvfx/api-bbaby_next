import coraline from '../../coraline';
import coralineVideos from './cor-videos';
import coralineImage from './cor-image';
import url from 'url';
import fs from 'fs';
import https from 'https';
import http from 'http';
import path from 'path';
import { buildMediaPath, buildMediaUrl } from '../../utils/coralineFunctions';
import { catchError } from '../crlerror';
import util from 'util';

const coralineMedia = {
  image: coralineImage,
  videos: coralineVideos,
  getUrlFromPath: (folder: string) => {
    const extra_path = folder.split('/static/');
    const url = `${process.env.SERVER_URL}/static/${extra_path[1]}`;
    return url;
  },
  saveAudio: async (audio: string, output: string) => {
    try {
      const buffer = Buffer.from(audio, 'base64');
      const writeFile1 = util.promisify(fs.writeFile);
      await writeFile1(output, buffer, 'binary');
      const audio_url = coraline.media.getUrlFromPath(output);
      return audio_url;
      // the output is already in the input so doesn't make sense to return the output
    } catch (err) {
      throw catchError(err);
    }
  },
  urlisImage: (url: string) => {
    return /\.(jpg|jpeg|png|webp|avif|gif|svg)$/.test(url);
  },
  urlisVideo: (url: string) => {
    return /\.(mp4)$/.test(url);
  },
  getMediaFromUrl: (media_url: string, public_id: string, type: 'videos' | 'images') => {
    return new Promise<CoralineImage>((resolve, reject) => {
      const protocol = url.parse(media_url).protocol;
      const fetcher = protocol === 'https:' ? https : http;
      fetcher.get(media_url, (res) => {
        if (res.statusCode === 302) {
          //redirect
          media_url = res.headers.location as string;
          coraline.media.getMediaFromUrl(media_url, public_id, type);
          return;
        }
        const format = res.headers['content-type']?.split('/')[1];
        if (!format) return reject('This URL does not contain any media!');
        const filename = buildMediaPath(public_id, type, format);
        const url = buildMediaUrl(public_id, type, format);
        const fileStream = fs.createWriteStream(filename);
        res.pipe(fileStream);
        fileStream.on('error', (err) => {
          const error = err as NodeJS.ErrnoException;
          if (error.code === 'ENOENT') {
            coraline.use(`/images/${public_id.split('/')[0]}`);
            coraline.media.getMediaFromUrl(url, public_id, type);
          } else {
            throw reject(err);
          }
        });
        fileStream.on('finish', () => {
          fileStream.close();
          const res = { filename, url, format };
          return resolve(res);
        });
      });
    });
  },
  useTempPath: (format: string) => {
    const regex = /\./;
    format = regex.test(format) ? format : `.${format}`;
    const folder = coraline.use('images/tmp');
    const id = coraline.generateRandomId(10);
    const filename = `${folder}/${id}${format}`;
    return filename;
  },
  getFiletype: (filepath: string) => {
    const ext = path.extname(filepath).toLowerCase();
    if (ext === '.jpg' || ext === '.jpeg' || ext === '.png' || ext === '.gif') {
      return 'image';
    } else if (ext === '.mp4' || ext === '.avi' || ext === '.mkv' || ext === '.wmv') {
      return 'video';
    } else {
      return 'unknown';
    }
  },
  splitBySize: async (file: string, size: number) => {
    try {
      const { buffer } = await fs.promises.readFile(file);

      for (let i = 0; i < buffer.byteLength; i += size) {
        const chunk = buffer.slice(i, i + size);
        await fs.promises.writeFile(`${file}_part${i}.flac`, Buffer.from(chunk));
      }
    } catch (err) {
      throw catchError(err);
    }
  },
};

export default coralineMedia;
