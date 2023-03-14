import fs from 'fs';
import path from 'path';
import { coraline_path, coralinemkDir, projectName } from './utils/coralineFunctions';
import coralMongo from './cor-route/coralMongo';
import coralineDate from './cor-route/cor-date';
const fsPromises = fs.promises;
import crypto from 'crypto';
import coralineMedia from './cor-route/media/cor-media';
import coralineColors from './cor-route/cor-colors';
import telegramapis from '../lib/telegramapis/telegramapis';
import { catchError, catchErrorCtrl } from './cor-route/crlerror';
import os from 'os';

const coraline = {
  stringify: (data: unknown) => {
    if (typeof data === 'string') {
      return data;
    }
    return JSON.stringify(data);
  },
  wait: (ms: number) => new Promise((resolve) => setTimeout(resolve, ms)),
  addHours: (numOfHours: number, date = new Date()) => {
    date.setTime(date.getTime() + numOfHours * 60 * 60 * 1000);
    return date;
  },
  arrayMove: (arr: [], fromIndex: number, toIndex: number) => {
    const element = arr[fromIndex];
    arr.splice(fromIndex, 1);
    arr.splice(toIndex, 0, element);
  },
  getRandomInt: (max: number) => {
    return Math.floor(Math.random() * max);
  },
  year: (options?: { min?: number; max?: number }) => {
    const min = options?.min || 0;
    const max = options?.max || new Date().getFullYear();
    return Math.floor(Math.random() * (max - min + 1)) + min;
  },
  getUniqueArray: (arr: [], key: string) => {
    return [...new Map(arr.map((item) => [item[key], item])).values()];
  },
  createPermalink: (text: string) => {
    let permalink = text.trim().replace(/ /g, '_');
    permalink = permalink
      .replace(/[^a-zA-Z0-9_]/g, '')
      .toLowerCase()
      .substring(0, 50)
      .trimEnd();
    return permalink;
  },
  use: (document: string) => {
    const isStatic = document.match('images') ? true : document.match('videos') ? true : false;
    const subFolder = isStatic ? 'static' : 'gov';
    const extra_path = path.join(subFolder, document);
    const isAbsolute = path.isAbsolute(extra_path);
    const folder = isAbsolute ? path.join(coraline_path, projectName, extra_path) : path.resolve(coraline_path, projectName, extra_path);
    const exist = fs.existsSync(folder);
    if (exist) {
      return folder;
    } else {
      return coralinemkDir(folder);
    }
  },
  useStatic: (document?: string) => {
    const extra_path = document ? path.join('static', document) : 'static';
    const isAbsolute = path.isAbsolute(extra_path);
    const folder = isAbsolute ? path.join(coraline_path, projectName, extra_path) : path.resolve(coraline_path, projectName, extra_path);
    const exist = fs.existsSync(folder);
    if (exist) {
      return folder;
    } else {
      return coralinemkDir(folder);
    }
  },
  saveFile: async (filename: string, file: unknown) => {
    try {
      const string = coraline.stringify(file);
      await fsPromises.writeFile(filename, string);
      await fsPromises.chmod(filename, '777');
    } catch (err) {
      const error = err as NodeJS.ErrnoException;
      if (error.code === 'ENOENT') {
        const folder = path.normalize(path.join(filename, '..'));
        const subfolder = folder
          .split(projectName + '/')[1]
          .split('/')
          .slice(1)
          .join('/');
        coraline.use(subfolder);
        await coraline.saveFile(filename, file);
      } else {
        throw catchError(err);
      }
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
    const find = fs.readFileSync(file);
    return JSON.parse(find.toString());
  },
  isUrl: (text: string) => {
    const urlRegex = /(((https?:\/\/)|(www\.))[^\s]+)/g;
    return text.match(urlRegex) ? true : false;
  },
  deleteFile: async (filename: string) => {
    try {
      await fsPromises.rm(filename);
      return true;
    } catch (err) {
      const error = err as NodeJS.ErrnoException;
      if (error.code === 'ENOENT') return true;
      throw catchError(err);
    }
  },
  clearFolder: async (folder: string) => {
    try {
      const content = await fsPromises.readdir(folder);
      content.forEach((file) => {
        const curPath = path.join(folder, file);
        if (fs.lstatSync(curPath).isDirectory()) {
          coraline.clearFolder(curPath);
        } else {
          coraline.deleteFile(curPath);
        }
      });
    } catch (err) {
      throw catchError(err);
    }
  },
  runAtSpecificTime: (hour: number, minute: number, callback: () => Promise<void>, repeat: boolean) => {
    const date = new Date();
    date.setHours(hour);
    date.setMinutes(minute);

    // If the scheduled time has already passed for today, schedule it for tomorrow or stop it

    if (date < new Date()) {
      if (repeat) {
        date.setDate(date.getDate() + 1);
      } else {
        return;
      }
    }

    const timeUntilFunction = date.getTime() - new Date().getTime();
    console.log(`new Timeout added at ${coraline.date.toYYMMDD(date)}`);
    setTimeout(async () => {
      try {
        await callback();
        if (repeat) {
          await coraline.wait(60000);
          coraline.runAtSpecificTime(hour, minute, callback, true);
        }
      } catch (err) {
        const error = 'Coraline: Error during a timeout';
        if (err instanceof Error) await coraline.sendLog(error + err.message);
        if (typeof err === 'string') await coraline.sendLog(error + err);
        await coraline.sendLog(error);
      }
    }, timeUntilFunction);
  },
  generateRandomId: (max: number) => {
    return crypto.randomBytes(max / 2).toString('hex');
  },
  sendLog: async (message: string, options?: SendMessageOptions) => {
    try {
      const logs_group_id = '-1001649395850';
      await telegramapis(process.env.TELEGRAM_TOKEN).sendMessage(logs_group_id, message, options);
    } catch (err) {
      throw catchError(err);
    }
  },
  performanceEnd: (start: number, api: string) => {
    const end = performance.now();
    const time = `api: ${api} took ${end - start} milliseconds`;
    return console.log(time);
  },
  memoryUsage: () => {
    const used = process.memoryUsage().heapUsed;
    const total = process.memoryUsage().heapTotal;
    const percentage = Math.round((used / total) * 10000) / 100;
    console.log(`Heap usage: ${percentage}%`);
  },
  getUserAgent: () => {
    const system = os.platform();
    let userAgent = '';
    if (system === 'darwin') {
      const macVersion = os.release().split('.')[0];
      const macArch = os.arch();
      userAgent = `Mozilla/5.0 (Macintosh; ${macArch} Mac OS X ${macVersion}) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.97 Safari/537.36`;
    } else if (system === 'linux') {
      userAgent = `Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:75.0) Gecko/20100101 Firefox/75.0`;
    } else if (system === 'win32') {
      const winVersion = os.release().split('.')[0];
      userAgent = `Mozilla/5.0 (Windows NT ${winVersion}; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/78.0.3904.97 Safari/537.36`;
    } else {
      userAgent = `Mozilla/5.0 (compatible; Node.js/${process.version}; ${process.platform} ${process.arch})`;
    }
    return userAgent;
  },
  media: coralineMedia,
  date: coralineDate,
  mongo: coralMongo,
  colors: coralineColors,
  catchError: catchError,
  catchErrorCtrl: catchErrorCtrl,
};

export default coraline;
