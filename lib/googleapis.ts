import config from '../config/config';
import fs from 'fs';

const {YOUTUBE_CLIENT_ID,YOUTUBE_CLIENT_SECRET,YOUTUBE_CREDENTIALS} = config;
const TOKEN_PATH = `${YOUTUBE_CREDENTIALS}/youtube_oauth_token.json`;

export const getAccessTokenWithRefreshToken = async (refresh_token: string) => {
    try {
        const googleTokenUrl = 'https://oauth2.googleapis.com/token'
        const headers = {'Content-Type' : 'application/x-www-form-urlencoded' }
        const body = new URLSearchParams({
            client_id: YOUTUBE_CLIENT_ID,
            client_secret: YOUTUBE_CLIENT_SECRET,
            grant_type: 'refresh_token',
            refresh_token
        })
        const getToken = await fetch(googleTokenUrl, {
            method: 'post',
            headers,
            body,
        })
        const credentials = await getToken.json()
        const error = {msg: 'Error while trying to get a new token!'}
        console.log(credentials)
        if (!getToken.ok) return error;
        if (!fs.existsSync(YOUTUBE_CREDENTIALS)) fs.mkdirSync(YOUTUBE_CREDENTIALS)
        fs.writeFileSync(TOKEN_PATH, JSON.stringify(credentials));
        return {msg: 'Created'}
    } catch (err) {
        if (err instanceof Error) {
            return {msg: err.message}
        } else {
            return {msg: 'Unknown error'}
        }
    }
}