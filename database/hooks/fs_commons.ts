import fs from 'fs';
const fsPromises = fs.promises;

export const path_check = async (path: string) => {
    try {
        return await fsPromises.mkdir(path, {recursive: true});   
    } catch (err: any) {
        if (err.code != 'EEXISTS') {
            throw new Error(err.message)
        }
    }
}