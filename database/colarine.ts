import fs from 'fs';
import path from 'path';
import { path_check } from './hooks/fs_commons';
const fsPromises = fs.promises;
const database_path = path.resolve(__dirname, '../database');

export const colarine = {
    initialize: async () => {
        try {
            const check = await path_check(database_path);
            console.log(check);
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
    }
}