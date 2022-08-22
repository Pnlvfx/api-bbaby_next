import config from '../config/config';
import fs from 'fs';
interface getAccessTokenProps {
    grant_type: 'authorization_code' | 'refresh_token',
    code?: string,
    redirect_uri?: string,
    refresh_token?: string
}

const fsPromises = fs.promises
const { YOUTUBE_CLIENT_ID,YOUTUBE_CLIENT_SECRET,YOUTUBE_CREDENTIALS } = config;
const TOKEN_PATH = `${YOUTUBE_CREDENTIALS}/youtube_oauth_token.json`;
const googleTokenUrl = 'https://oauth2.googleapis.com/token';
const headers = {'Content-Type' : 'application/x-www-form-urlencoded' };

const checkIfPathExists = async () => {
    try {
        await fsPromises.mkdir(YOUTUBE_CREDENTIALS)
    } catch (err: any) {
        if (err.code != 'EEXIST') {
            throw err
        }
    }
}

export const getAccessToken = async ({
    grant_type,
    code,
    redirect_uri,
    refresh_token
}: getAccessTokenProps) => {
    try {
        let body = null;
        if (code && redirect_uri) {
            body = new URLSearchParams({
                client_id: YOUTUBE_CLIENT_ID,
                client_secret: YOUTUBE_CLIENT_SECRET,
                grant_type,
                code,
                redirect_uri,
            })
        } else if (refresh_token) {
            body = new URLSearchParams({
                clientid: YOUTUBE_CLIENT_ID,
                client_secret: YOUTUBE_CLIENT_SECRET,
                grant_type,
                refresh_token
            })
        }
        const getToken = await fetch(googleTokenUrl, {
            method: 'post',
            headers,
            body
        })
        const credentials = await getToken.json()
        if (!getToken.ok) throw new Error('Error while trying to get a new token!');
        if (grant_type === 'refresh_token') {
            return credentials as Credentials
        }
        await checkIfPathExists()
        await fsPromises.writeFile(TOKEN_PATH, JSON.stringify(credentials))
        return credentials as Credentials
    } catch (err) {
        if (err instanceof Error) {
            throw new Error(err.message)
        } else {
            throw new Error('Unknown error')
        }
    }
}
