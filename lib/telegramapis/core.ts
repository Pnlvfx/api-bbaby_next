import MTProto from '@mtproto/core';
import config from '../../config/config';
import coraline from '../../database/coraline';
import { catchError } from '../common';
import telegramapis from './telegramapis';

const initialize = () => {
    const api_id = config.TELEGRAM_API_KEY;
    const api_hash = config.TELEGRAM_API_HASH;
    const pre = coraline.use('token');
    const path = `${pre}/telegram_token.json`;
    const mtproto = new MTProto({
        api_id,
        api_hash,
        storageOptions: {
            path,
        },
    });
    return mtproto
}

const core = {
    getUser: async () => {
        try {
            const api = initialize();
            const user = await api.call('users.getFullUser', {
                id: {
                    _: 'inputUserSelf'
                },
            });
            console.log(user);
            return user;
        } catch (err) {
            console.log(err);
            catchError(err);
        }
    },
    searchMusic: async () => {
        try {
            const user = await telegramapis.core.getUser();
            console.log(user);
        } catch (err) {
            catchError(err);
        }
    },
}

export default core