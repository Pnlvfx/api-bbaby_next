import fs from 'fs';
import path from 'path';
import { catchError } from '../lib/common';
import { baseDocument, buildMediaPath, buildMediaUrl, coralinemkDir, stringify } from './utils/coralineFunctions';
import https from 'https';
import { VideoProps } from './@types/video';
import sharp from 'sharp';
import coralMongo from './utils/cor-route/coralMongo';
const fsPromises = fs.promises;

const coraline = {
  addHours: (numOfHours: number, date = new Date()) => {
    date.setTime(date.getTime() + numOfHours * 60 * 60 * 1000);
    return date;
  },
  arrayMove: (arr: any[], fromIndex: number, toIndex: number) => {
    const element = arr[fromIndex];
    arr.splice(fromIndex, 1);
    arr.splice(toIndex, 0, element);
  },
  getRandomInt: (max: number) => {
    return Math.floor(Math.random() * max);
  },
  validateEmail: (email: string) => {
    const res =
      /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return res.test(email);
  },
  getUniqueArray: (arr: any[], key: string) => {
    return [...new Map(arr.map((item) => [item[key], item])).values()];
  },
  getMediaFromUrl: (url: string, public_id: string, type: 'videos' | 'images') => {
    return new Promise<{
      filename: string;
      url: string;
    }>((resolve, reject) => {
      https.get(url, (res) => {
        const format = res.headers['content-type']?.split('/')[1];
        if (!format) return reject('This URL does not contain any images!');
        const filename = buildMediaPath(public_id, type, format);
        const url = buildMediaUrl(public_id, type, format);
        const fileStream = fs.createWriteStream(filename);
        res.pipe(fileStream);
        fileStream.on('error', (err) => {
          if (err.message.match('no such file or directory')) {
            coraline.use('/images/posts');
            return reject(err);
          } else {
            return reject(err);
          }
        });
        fileStream.on('finish', () => {
          fileStream.close();
          const res = { filename, url };
          return resolve(res);
        });
      });
    });
  },
  resize: async (image: { filename: string; url: string }) => {
    try {
      const arr = image.filename.split('.');
      const newFile = `${arr[0]}_1920x1080.${arr[1]}`;
      const newUrl = image.url + '?w=1920&h=1080';
      await sharp(image.filename).resize(1920, 1080).toFile(newFile);
      const res = {
        filename: newFile,
        url: newUrl,
      };
      return res;
    } catch (err) {
      throw catchError(err);
    }
  },
  detectUrl: (text: string) => {
    var urlRegex = /(((https?:\/\/)|(www\.))[^\s]+)/g;
    return text.match(urlRegex) ? true : false;
  },
  urlisImage: (url: string) => {
    return /\.(jpg|jpeg|png|webp|avif|gif|svg)$/.test(url);
  },
  urlisVideo: (url: string) => {
    return /\.(mp4)$/.test(url);
  },
  use: (document: string) => {
    const isStatic = document.match('images') ? true : document.match('videos') ? true : false;
    const subFolder = isStatic ? 'static' : 'gov';
    const final_path = coralinemkDir(path.join(subFolder, document));
    return final_path;
  },
  useDocument: async (document: string) => {
    try {
      const final_path = coralinemkDir(path.join('gov', document));
      const final_file = `${final_path}/${document}.json`;
      const jsonDocument = await coraline.saveJSON(final_file, baseDocument(document));
      const file = await coraline.readJSON(final_file);
      return file;
    } catch (err) {
      throw catchError(err);
    }
  },
  saveJSON: async (filename: string, file: unknown) => {
    const isArray = Array.isArray(file);
    try {
      const json = stringify(file);
      await fsPromises.writeFile(filename, json);
    } catch (err) {
      throw catchError(err);
    }
  },
  readJSON: async (file: string) => {
    try {
      const _find = await fsPromises.readFile(file);
      return JSON.parse(_find.toString());
    } catch (err) {
      throw catchError(err);
    }
  },
  readJSONSync: (file: string) => {
    try {
      const find = fs.readFileSync(file);
      return JSON.parse(find.toString());
    } catch (err) {
      catchError(err);
    }
  },
  videos: {
    splitId: (public_id: string) => {
      try {
        const collection = public_id.split('/');
        if (collection.length !== 2) throw new Error('Invalid public_id');
        return { collection: collection[0], id: collection[1] };
      } catch (err) {
        throw catchError(err);
      }
    },
    buildUrl: (collection: string, id: string) => {
      const url = `${process.env.SERVER_URL}/videos/${collection}/${id}.mp4`;
      return url;
    },
    saveVideo: async (public_id: string, file: string, width: number, height: number) => {
      try {
        const data = coraline.videos.splitId(public_id);
        if (!data) throw new Error(`No data found`);
        const collection = coralinemkDir(`/static/videos/${data.collection}`);
        const filename = `${collection}/${data.id}.mp4`;
        const isUrl = coraline.detectUrl(file);
        if (isUrl) {
          https.get(file, (res) => {
            const fileStream = fs.createWriteStream(filename);
            res.pipe(fileStream);
            fileStream.on('error', (err) => {
              console.log(err);
            });
            fileStream.on('finish', () => {
              fileStream.close();
            });
          });
        } else {
          const buffer = Buffer.from(file.split(',')[1], 'base64');
          const save = await fsPromises.writeFile(filename, buffer);
        }
        const url = coraline.videos.buildUrl(data.collection, data.id);
        const video = {
          url,
          folder: data.collection,
          format: 'mp4',
          created_at: new Date().toISOString(),
          version: 1,
          public_id,
          resource_type: 'video',
          width,
          height,
        };
        return video as VideoProps;
      } catch (err) {
        throw catchError(err);
      }
    },
  },
  mongo: coralMongo,
};

export default coraline;
