import config from '../config/config';
import fs from 'fs';
import YoutubeToken from '../models/YoutubeToken';
const fsPromises = fs.promises

const googleapis = {
    createGoogleOauth: async (origin: string) => {
        try {
            const base_url = 'https://accounts.google.com/o/oauth2/v2/auth'
            const {YOUTUBE_CLIENT_ID} = config;
            const SCOPES = ['https://www.googleapis.com/auth/youtube.upload']
            const googleAuth = `${base_url}?access_type=offline&scope=${SCOPES}&prompt=consent&response_type=code&client_id=${YOUTUBE_CLIENT_ID}&redirect_uri=${origin}&state=bbabystyle`
            return googleAuth;
        } catch (err) {
            if (err instanceof Error) {
                throw new Error(err.message);
            } else {
                throw new Error(`That's strange!`)
            }
        }
    },
    youtube: {
        insert: async () => {
            
        }
    },
    checkTokenValidity: async () => {
        try {
            const token = await YoutubeToken.find({});
            console.log(token);
            if (!token) return false;
            return true;
        } catch (err) {
            if (err instanceof Error) throw new Error(err.message)
        }
    }
}

export default googleapis;

interface getAccessTokenProps {
    grant_type: 'authorization_code' | 'refresh_token',
    code?: string,
    redirect_uri?: string,
    refresh_token?: string
}

const { YOUTUBE_CLIENT_ID,YOUTUBE_CLIENT_SECRET,YOUTUBE_CREDENTIALS } = config;
const TOKEN_PATH = `${YOUTUBE_CREDENTIALS}/youtube_oauth_token.json`;
const googleTokenUrl = 'https://oauth2.googleapis.com/token';
const headers = {'Content-Type' : 'application/x-www-form-urlencoded' };

export const getAccessToken = async ({
    grant_type,
    code,
    redirect_uri,
    refresh_token
}: getAccessTokenProps) => {
    try {
        let body = null;
        if (code && redirect_uri) {
            console.log("with code")
            body = new URLSearchParams({
                client_id: YOUTUBE_CLIENT_ID,
                client_secret: YOUTUBE_CLIENT_SECRET,
                grant_type,
                code,
                redirect_uri,
            })
        } else if (refresh_token) {
            console.log("with_refresh")
            body = new URLSearchParams({
                client_id: YOUTUBE_CLIENT_ID,
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
        //await colarine.path_check(YOUTUBE_CREDENTIALS);
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
