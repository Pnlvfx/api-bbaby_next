import path from 'path';
import config from '../../config/config';
import fs from 'fs';
import telegramapis from '../../lib/telegramapis';
import { catchError } from '../../lib/common';

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
                telegramapis.sendLog(`coralineMkDir error`).then(() => {
                    catchError(err, 'coraline.mkDir');
                })
            }
            return where;
        }
        return where;
    })
    return where;
}