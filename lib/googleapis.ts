import { youtube_v3 } from 'googleapis';
import config from '../config/config';
import coraline from '../database/coraline';
import { catchError } from './common';

const { YOUTUBE_CLIENT_ID } = config;

const googleapis = {
    createGoogleOauth: async (origin: string) => {
        try {
            const base_url = 'https://accounts.google.com/o/oauth2/v2/auth'
            const access_type = 'offline';
            const prompt = 'consent';
            const SCOPES = ['https://www.googleapis.com/auth/youtube.upload']
            const googleAuth = `${base_url}?scope=${SCOPES}&prompt=${prompt}&response_type=code&client_id=${YOUTUBE_CLIENT_ID}&redirect_uri=${origin}&state=bbabystyle`
            return googleAuth;
        } catch (err) {
            if (err instanceof Error) {
                throw new Error(err.message);
            } else {
                throw new Error(`That's strange!`)
            }
        }
    },
    checkTokenValidity: async () => {
        try {
            const tokenPath = await coraline.use('token');
            const file = `${tokenPath}/youtube_access_token.json`;
            const data: MyCredentials = await coraline.find(file);
            const now = new Date()
            const expires = new Date(data.expires);
            if (now > expires) throw new Error(`Token is expired!`)
            const credentials = data?.credentials;
            if (!credentials.access_token) throw new Error(`Token not found!`)
            return credentials;
        } catch (err) {
            if (err instanceof Error) throw new Error(err.message)
            throw new Error(`Something strange is happening!`)
        }
    },
    youtube: {
        insert: async (title : string, description: string, tags: string, categoryId: string,privacyStatus: string) => {
            try {
                const base_url = `https://youtube.googleapis.com/youtube/v3/videos`;
                const query = `part=snippet&part=status&key=${YOUTUBE_CLIENT_ID}`
                const url = `${base_url}?${query}`;
                const youtubeFolder = await coraline.use('youtube');
                const videoFilePath =  `${youtubeFolder}/video1.mp4`;
                const thumbFilePath = `${youtubeFolder}/image0.webp`;
                const credentials = await googleapis.checkTokenValidity();
                const headers = {
                    'Authorization': `Bearer ${credentials.access_token}`,
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
                const input: youtube_v3.Schema$Video = {
                    snippet : {
                        title,
                        description,
                        tags: [tags],
                        categoryId,
                        defaultAudioLanguage: 'it',
                        defaultLanguage: 'it'
                    },
                    status: {
                        privacyStatus
                    },
                }
                const body = JSON.stringify(input);
                const response = await fetch(url, {
                    method: 'post',
                    headers,
                    body
                })
                if (response.statusText === 'Unauthorized') {
                    throw new Error('Youtube API says you are unauthorized')
                }
                const isJson = response.headers.get('content-type')?.includes('application/json')
                const data = isJson ? await response.json() : null;
                if (!response.ok) {
                    console.log(response.status, response.statusText)
                    console.log(data);
                    const error = data.error.message;
                    throw new Error(error);
                } else {
                    console.log(data);
                }
            } catch (err) {
                catchError(err)
            }
        }
    },
}

export default googleapis;

interface getAccessTokenProps {
    grant_type: 'authorization_code' | 'refresh_token',
    code?: string,
    redirect_uri?: string,
    refresh_token?: string
}

export const getAccessToken = async ({ grant_type, code, redirect_uri, refresh_token }: getAccessTokenProps) => {
    const { YOUTUBE_CLIENT_SECRET } = config;
    const googleTokenUrl = 'https://oauth2.googleapis.com/token';
    const headers = {'Content-Type' : 'application/x-www-form-urlencoded' };
    try {
        let body = null;
        if (code && redirect_uri) {
            console.log("google access token with code")
            body = new URLSearchParams({
                client_id: YOUTUBE_CLIENT_ID,
                client_secret: YOUTUBE_CLIENT_SECRET,
                grant_type,
                code,
                redirect_uri,
            })
        } else if (refresh_token) {
            console.log("google access token : with_refresh")
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
        if (!getToken.ok) throw new Error(getToken.status + getToken.statusText + 'Error while trying to get a new token!');
        const tokenPath = await coraline.use('token')
        const file = `${tokenPath}/youtube_access_token.json`;
        const credentials: Credentials = await getToken.json();
        const now = new Date();
        const expires = coraline.addHours(1, now)
        const data = {
            expires,
            credentials
        }
        await coraline.saveJSON(file, data);
        return credentials
    } catch (err) {
        if (err instanceof Error) {
            throw new Error(err.message)
        } else {
            throw new Error('Unknown error')
        }
    }
}
