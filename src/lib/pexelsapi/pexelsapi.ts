import fs from 'fs';
import config from '../../config/config';
import { catchError } from '../../coraline/cor-route/crlerror';
import https from 'https';
import { PexelsImageOptions, PexelsVideoOptions, PhotosWithTotalResults, Videos } from './types/pexels';

const headers = {
  Authorization: config.PEXELS_API_KEY,
};

const pexelsapi = {
  getImage: async (text: string, options?: PexelsImageOptions) => {
    try {
      let url = `https://api.pexels.com/v1/search?query=${text}`;
      if (options) {
        const usedOptions = Object.entries(options).filter(([, value]) => value !== undefined);
        usedOptions.forEach(([key, value]) => {
          url += `&${key}=${value}`;
        });
      }
      const res = await fetch(url, {
        method: 'GET',
        headers,
      });
      const data = (await res.json()) as PhotosWithTotalResults;
      if (!res.ok) throw new Error('Pexels API error.');
      return data.photos;
    } catch (err) {
      throw catchError(err);
    }
  },
  getVideo: async (text: string, options?: PexelsVideoOptions) => {
    try {
      let url = `https://api.pexels.com/videos/search?query=${text}`;
      if (options) {
        const usedOptions = Object.entries(options).filter(([, value]) => value !== undefined);
        usedOptions.forEach(([key, value]) => {
          url += `&${key}=${value}`;
        });
      }
      const res = await fetch(url, {
        method: 'GET',
        headers,
      });
      const data = (await res.json()) as Videos;
      if (!res.ok) throw new Error('Pexels API error.');
      return data.videos;
    } catch (err) {
      throw catchError(err);
    }
  },
  downloadVideo: (url: string, output: string) => {
    return new Promise<string>((resolve, reject) => {
      const downloadVideo = (url: string) => {
        https.get(url, (res) => {
          if (res.statusCode === 302) {
            url = res.headers.location as string;
            downloadVideo(url);
            return;
          }
          if (res.statusCode !== 200) {
            res.resume();
            reject('Something went wrong when downloading a video from Pexels');
          }
          res.pipe(fs.createWriteStream(output));
          res.on('close', () => {
            resolve(output);
          });
        });
      };
      downloadVideo(url);
    });
  },
};

export default pexelsapi;
