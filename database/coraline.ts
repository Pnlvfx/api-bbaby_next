import fs from 'fs';
import path from 'path';
import { catchError } from '../lib/common';
const fsPromises = fs.promises;

const stringify = (data: unknown) => {
    if (typeof data === 'string') {
      return data;
    }
    return JSON.stringify(data);
  }


type path = '/home/simone/simone/coraline + your path';
const base_path = '/home/simone/simone/coraline';

const coraline = {
    mkDir: async (extra_path: string) => {
        try {
            const isAbsolute = path.isAbsolute(extra_path);
            const where = isAbsolute ? path.join(base_path, extra_path) : path.resolve(base_path, extra_path);
            fs.mkdir(where, {recursive: true}, (err) => {
                if (err) {
                    if (err.code != 'EEXIST') {
                        new Error(err.message);
                    } else {
                        return where as path
                    }
                }
                return where as path;
            })
            return where as path;
        } catch (err) {
            console.log('error from catch')
            catchError(err);
        }
    },
    initialize: async () => {
        try {
            
        } catch (err) {
            if (err instanceof Error) {
                console.log(err.message);
                throw new Error(err.message);
            }
        }
    },
    addHours: (numOfHours: number, date = new Date()) => {
        date.setTime(date.getTime() + numOfHours * 60 * 60 * 1000);
        return date;
    },
    saveImages: async (path: string,file: string) => {
        try {
            await fsPromises.mkdir(path, {recursive: true});
        } catch (err: any) {
            if (err.code != 'EEXISTS') {
                throw new Error(err.message)
            }
        }
    },
    use : async (document: string) => {
        const final_path = path.join(base_path, 'gov', document);
        try {
            coraline.mkDir(path.join('gov', document))   
        } catch (error) {
            
        }
        return final_path;
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
    }
}

export default coraline;