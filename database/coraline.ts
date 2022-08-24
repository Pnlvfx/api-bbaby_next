import fs from 'fs';
import config from '../config/config';
import path from 'path';
import { catchError } from '../lib/common';
import { VideoProps } from './@types/video';
import telegramapis from '../lib/telegramapis';
const fsPromises = fs.promises;

const stringify = (data: unknown) => {
    if (typeof data === 'string') {
      return data;
    }
    return JSON.stringify(data);
  }
const base_path = '/home/simone/simone/coraline';

const mkDir = (extra_path: string) => {
    const isAbsolute = path.isAbsolute(extra_path);
    const where = isAbsolute ? path.join(base_path, extra_path) : path.resolve(base_path, extra_path);
    fs.mkdir(where, {recursive: true}, (err) => {
        if (err) {
            if (err.code != 'EEXIST') {
                telegramapis.sendLog(`coralineMkDir error`)
                catchError(err);
            }
            return where;
        }
        return where;
    })
    return where;
}

const coraline = {
    initialize: async () => {
        try {
            
        } catch (err) {
            catchError(err)
        }
    },
    addHours: (numOfHours: number, date = new Date()) => {
        date.setTime(date.getTime() + numOfHours * 60 * 60 * 1000);
        return date;
    },
    use : async (document: string) => {
        const isStatic = document.match('images') ? true : document.match('videos')? true : false;
        const subFolder = isStatic ? 'static' : 'gov';
        try {
            const final_path = mkDir(path.join(subFolder, document))
            return final_path;
        } catch (err) {
            catchError(err);
        }
    },
    saveJSON: async (filename: string, file: any) => {
        try {
            const json = stringify(file)
            await fsPromises.writeFile(filename, json);
        } catch (err) {
            catchError(err)
        }
    },
    find: async (file: string) => {
        try {
            const _find = await fsPromises.readFile(file);
            if (!_find) throw new Error(`File not found!`);
            return JSON.parse(_find.toString());
        } catch (err) {
            catchError(err);
        }
    },
    videos: {
        splitId: (public_id: string) => {
                try {
                    const collection = public_id.split('/');
                    if (collection.length !== 2) throw new Error('Invalid public_id')
                    return {collection: collection[0], id: collection[1]}
                } catch (error) {
                    catchError(error);
                }
        },
        buildUrl: (collection: string, id: string) => {
            const {SERVER_URL} = config;
            const url = `${SERVER_URL}/videos${collection}/${id}.mp4`;
            return url;
        },
        saveVideo: async (public_id: string, file: string, width: number, height: number) => {
            try {
                const data = coraline.videos.splitId(public_id);
                if (!data) throw new Error(`No data found`)
                const collection = await mkDir(`/static/videos/${data.collection}`);
                if (!collection) throw new Error(`No collection found`);
                const name = `${collection}/${data.id}.mp4`;
                let buffer = Buffer.from(file.split(',')[1],"base64");
                const save = await fsPromises.writeFile(name, buffer);
                const url = coraline.videos.buildUrl(collection, data.id)
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
                }
                return video as VideoProps;
            } catch (err) {
                return catchError(err);
            }
        },
    }
}

export default coraline;