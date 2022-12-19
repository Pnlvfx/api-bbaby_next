import { youtube_v3 } from 'googleapis';
import config from '../../config/config';
import coraline from '../../coraline/coraline';
import { catchError } from '../common';
import telegramapis from '../telegramapis/telegramapis';
import serviceAccounts from './service-account';

const { YOUTUBE_CLIENT_ID, YOUTUBE_CLIENT_SECRET } = config;

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
            const tokenPath = coraline.use('token');
            const file = `${tokenPath}/youtube_token.json`;
            const data: MyCredentials = await coraline.readJSON(file);
            const now = new Date()
            const expires = new Date(data.expires);
            if (now > expires) throw new Error(`Token is expired!`)
            const credentials = data?.credentials;
            if (!credentials.access_token) throw new Error(`Token not found!`)
            return credentials;
        } catch (err) {
            throw catchError(err);
        }
    },
    youtube: {
        insert: async (title : string, description: string, tags: string, categoryId: string,privacyStatus: string) => {
            try {
                const base_url = `https://youtube.googleapis.com/youtube/v3/videos`;
                const query = `part=snippet&part=status&key=${YOUTUBE_CLIENT_ID}`
                const url = `${base_url}?${query}`;
                const youtubeFolder = coraline.use('youtube');
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
                    const error = data.error.message;
                    throw new Error(error);
                } else {
                    console.log(data);
                }
            } catch (err) {
                throw catchError(err)
            }
        }
    },
    serviceAccount: serviceAccounts,
    translate: async (text: string, lang: string, tokens: Credentials) => {
        try {
            const projectId = 'bbabystyle';
            const location = 'us-central1';
            const parent = `projects/${projectId}/locations/${location}`;
            const mimeType = 'text/plain';
            const sourceLanguageCode = lang === 'en' ? lang : 'it'
            const targetLanguageCode = lang === 'en' ? 'it' : 'en'
            const url = `https://translate.googleapis.com/v3beta1/${parent}:translateText`;
            const body = JSON.stringify({
                contents: [text],
                targetLanguageCode,
                sourceLanguageCode,
                mimeType
            })
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    "Accept": "application/json",
                    Authorization: `Bearer ${tokens.access_token}`
                },
                body
            });
            if (!response.ok) {
                if (response.status === 401) {
                    return undefined; //if undefined token is expired
                } else {
                    throw new Error(`${response.status, response.statusText}`)
                }
            } else {
                const data = await response.json();
                for (const translation of data.translations) {
                    return translation.translatedText as string
                }
            }
        } catch (err) {
            throw catchError(err);
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

export const getAccessToken = async ({ grant_type, code, redirect_uri, refresh_token }: getAccessTokenProps) => {
    const googleTokenUrl = 'https://oauth2.googleapis.com/token';
    const headers = {'content-type' : 'application/x-www-form-urlencoded'};
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
                client_id: YOUTUBE_CLIENT_ID,
                client_secret: YOUTUBE_CLIENT_SECRET,
                grant_type,
                refresh_token
            })
        }
        const response = await fetch(googleTokenUrl, {
            method: 'post',
            headers,
            body
        })
        if (!response.ok) {
            const error = await response.text();
            await telegramapis.sendLog(response.status + response.statusText + 'Error while trying to get a new token!' + error);
            throw new Error(response.status + response.statusText + 'Error while trying to get a new token!');
        }
        const tokenPath = coraline.use('token')
        if (!tokenPath) {
            await telegramapis.sendLog('Not token path')
            throw new Error(`Error while trying to create a token path!`)
        }
        await telegramapis.sendLog(tokenPath);
        const file = `${tokenPath}/youtube_token.json`;
        const credentials: Credentials = await response.json();
        await telegramapis.sendLog('Access API correctly');
        const now = new Date();
        const expires = coraline.addHours(1, now)
        const data = {
            expires,
            credentials
        }
        await coraline.saveJSON(file, data);
        return credentials;
    } catch (err) {
        throw catchError(err);
    }
}
