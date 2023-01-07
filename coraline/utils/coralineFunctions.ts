import path from 'path';
import fs from 'fs';
import coraline from '../coraline';

export const stringify = (data: unknown) => {
    if (typeof data === 'string') {
      return data;
    }
    return JSON.stringify(data);
  }

const _path = process.cwd();  
const base_path = path.resolve(_path, '../coraline')
const projectName = _path.split('/')[_path.split('/').length - 1].replace('api-', '').replace('api_', '');

export const coralinemkDir = (extra_path: string) => {
    const isAbsolute = path.isAbsolute(extra_path);
    const where = isAbsolute ? path.join(base_path, projectName, extra_path) : path.resolve(base_path, projectName, extra_path);
    fs.mkdir(where, {recursive: true}, (err) => {
        if (err) {
            if (err.code != 'EEXIST') {
                throw new Error(err.message);
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
    const url = `${process.env.SERVER_URL}/${type}/${split[0]}/${split[1]}.${format}`;
    const query = `?w=${w}&h=${h}`
    const final_url = w && h ? `${url}${query}` : url;
    return final_url;
}