import path from 'path';
import config from '../../config/config';
import fs from 'fs';
import { catchError } from '../../lib/common';
import coraline from '../coraline';

export const baseDocument = (document: string) => {
    try {
        [document]
    } catch (err) {
        catchError(err)
    }
}

export const stringify = (data: unknown) => {
    if (typeof data === 'string') {
      return data;
    }
    return JSON.stringify(data);
  }

const {NODE_ENV} = config;
const base_path =  NODE_ENV === 'production' ? `/home/simonegauli/coraline` : '/home/simone/simone/coraline';

export const coralinemkDir = (extra_path: string) => {
    const isAbsolute = path.isAbsolute(extra_path);
    const where = isAbsolute ? path.join(base_path, extra_path) : path.resolve(base_path, extra_path);
    fs.mkdir(where, {recursive: true}, (err) => {
        if (err) {
            if (err.code != 'EEXIST') {
                    throw catchError(err);
            }
            return where;
        }
        return where;
    })
    return where;
}

export const buildMediaPath = (public_id: string, type: 'images' | 'videos', format: string) => {
    const split = public_id.split('/');  //split 1 is folder aplit[2] is the id
    const path = coraline.use(type);
    const filename = `${path}/${split[0]}/${split[1]}.${format}`;
    return filename;
}

export const buildMediaUrl = (public_id: string, type: 'images' | 'videos', format: string, w?: number, h?: number) => {
    const split = public_id.split('/');
    const base_url = config.SERVER_URL;
    const url = `${base_url}/${type}/${split[0]}/${split[1]}.${format}`;
    const query = `?w=${w}&h=${h}`
    const final_url = w && h ? `${url}${query}` : url;
    return final_url;
}