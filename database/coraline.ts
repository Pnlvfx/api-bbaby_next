import fs from 'fs';
import config from '../config/config';
import path from 'path';
import { catchError } from '../lib/common';
import { baseDocument, coralinemkDir, stringify } from './utils/coralineFunctions';
import collections from './utils/route/collections';
import telegramapis from '../lib/telegramapis';
import https from 'https';
import { VideoProps } from './@types/video';
const fsPromises = fs.promises;

const coraline = {
    addHours: (numOfHours: number, date = new Date()) => {
        date.setTime(date.getTime() + numOfHours * 60 * 60 * 1000);
        return date;
    },
    detectUrl: (text: string) => {
        try {
            var urlRegex = /(((https?:\/\/)|(www\.))[^\s]+)/g;
            return text.match(urlRegex) ? true : false;
        } catch (err) {
            catchError(err);
        }
    },
    use : async (document: string) => {
        const isStatic = document.match('images') ? true : document.match('videos') ? true : false;
        const subFolder = isStatic ? 'static' : 'gov';
        try {
            const final_path = coralinemkDir(path.join(subFolder, document))
            return final_path;
        } catch (err) {
            catchError(err, 'coraline.use');
        }
    },
    useDocument: async (document: string) => {
        try {
            const final_path = coralinemkDir(path.join('gov', document));
            const final_file = `${final_path}/${document}.json`
            const jsonDocument = await coraline.saveJSON(final_file, baseDocument(document))
            const file = await coraline.find(final_file);
            return file;
        } catch (err) {
            catchError(err, 'coraline.useDocument');
        }
    },
    saveJSON: async (filename: string, file: unknown) => {
        const isArray = Array.isArray(file);
        try {
            const json = stringify(file)
            await fsPromises.writeFile(filename, json);
        } catch (err) {
            catchError(err, 'coraline.saveJSON')
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
    collections : (collectionName: string) => {
        const f_path = coralinemkDir(path.join('gov', collectionName));
        coraline.find(`${f_path}/${collectionName}.json`).then((mainDocument) => {
            return collections;
        });
    },
    videos: {
        splitId: (public_id: string) => {
                try {
                    const collection = public_id.split('/');
                    if (collection.length !== 2) throw new Error('Invalid public_id')
                    return {collection: collection[0], id: collection[1]}
                } catch (err) {
                    catchError(err);
                }
        },
        buildUrl: (collection: string, id: string) => {
            const {SERVER_URL} = config;
            const url = `${SERVER_URL}/videos/${collection}/${id}.mp4`;
            return url;
        },
        saveVideo: async (public_id: string, file: string, width: number, height: number) => {
            try {
                const data = coraline.videos.splitId(public_id);
                console.log(data);
                if (!data) throw new Error(`No data found`);
                const collection = coralinemkDir(`/static/videos/${data.collection}`);
                const filename = `${collection}/${data.id}.mp4`;
                const isUrl = coraline.detectUrl(file);
                if (isUrl) {
                    https.get(file, (res) => {
                        const fileStream = fs.createWriteStream(filename);
                        res.pipe(fileStream);
                        fileStream.on('error', (err) => {
                            console.log(err)
                        })
                        fileStream.on('finish', () => {
                            fileStream.close();
                        })
                    })
                } else {
                    const buffer = Buffer.from(file.split(',')[1],"base64");
                    const save = await fsPromises.writeFile(filename, buffer);
                }
                const url = coraline.videos.buildUrl(data.collection, data.id)
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
                telegramapis.sendLog('Video saved successfully');
                return video as VideoProps;
            } catch (err) {
                catchError(err);
            }
        },
    }
}

export default coraline;