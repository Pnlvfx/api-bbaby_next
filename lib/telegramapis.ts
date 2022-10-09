import config from '../config/config';
import fs from 'fs';
import { catchError } from './common';
const fsPromises = fs.promises;
const base_url = 'https://api.telegram.org'
const logs_group_url = '-1001649395850'
const token = config.TELEGRAM_TOKEN;
import MTProto from '@mtproto/core';
import path from 'path';


const telegramapis = {
    buildUrl: (METHOD: string) => {
        return `${base_url}/bot${token}/${METHOD}`;
    },
    sendMessage: async (chatId: string, text: string) => {
        try {
            const url = telegramapis.buildUrl('sendMessage')
            const url_q = `${url}?chat_id=${chatId}&text=${text}`;
            const headers = {
                "content-type" : 'application/x-www-form-urlencoded'
            }
            const res = await fetch(url_q, {
                method: 'POST',
                headers,
            })
            const data = await res.json()
            if (!data) catchError(data?.msg);
            return data;
        } catch (err) {
            catchError(err);
        }
    },
    getChatId : async () => {
        try {
            const url = telegramapis.buildUrl('getUpdates');
            const headers = {
                "Content-Type" : 'application/x-www-form-urlencoded'
            }
            const res = await fetch(url, {
                method: 'POST',
                headers,
            })
            const response = await res.json()
            await fsPromises.writeFile('telegramLogs.json', JSON.stringify(response));
        } catch (err) {
            catchError(err)
        }
    },
    sendLog : async (message: string) => {
        try {
            telegramapis.sendMessage(logs_group_url, message);
        } catch (err) {
            catchError(err);
        }
    },
    core: {
        searchMusic: async () => {
            try {
                console.log('ciao')
                const api_id = config.TELEGRAM_API_KEY;
                const api_hash = config.TELEGRAM_API_HASH;
                const mtproto = new MTProto({
                    api_id,
                    api_hash,
                    storageOptions: {
                        path: path.resolve(__dirname, './telegram_core/session.json'),
                    },
                });
                const res = await mtproto.call('messages.searchMessages')
                console.log(res);
            } catch (err) {
                catchError(err);
            }
        },
    }
}

export default telegramapis;