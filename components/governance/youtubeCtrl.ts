import type { Request, Response } from "express";
import config from '../../config/config';
import { isGoogleAPI } from "../../lib/APIaccess";
import fs from 'fs';
import { UserRequest } from "../../@types/express";
import { Credentials } from "google-auth-library";
import { getAccessTokenWithRefreshToken } from "../../lib/googleapis";

const {PUBLIC_PATH, YOUTUBE_CLIENT_ID,YOUTUBE_CLIENT_SECRET,CLIENT_URL,YOUTUBE_CREDENTIALS} = config;
const TOKEN_PATH = `${YOUTUBE_CREDENTIALS}/youtube_oauth_token.json`;
const redirect_uri = `${CLIENT_URL}/governance`;

const authorize = () => {
    const exists = fs.existsSync(TOKEN_PATH);
    if (exists) {
        const buffer = fs.readFileSync(TOKEN_PATH)
        const credentials = JSON.parse(buffer.toString())
        return credentials as Credentials;
    } else {
        throw new Error;
    }
}

const youtubeCtrl = {
    youtubeAccessToken: async (expressRequest: Request, res: Response) => {
        try {
            const req = expressRequest as UserRequest;
            const googleTokenUrl = 'https://oauth2.googleapis.com/token'
            const {code} = req.query;
            if (!code) return res.status(400).json({msg: "No code find in your query."});
            const body = new URLSearchParams({
                code: code.toString(),
                client_id: YOUTUBE_CLIENT_ID,
                client_secret: YOUTUBE_CLIENT_SECRET,
                redirect_uri,
                grant_type: 'authorization_code'
            })
            const getToken = await fetch(googleTokenUrl, {
                method: 'post',
                body,
                headers: {'Content-Type' : 'application/x-www-form-urlencoded' }
            })
            const credentials = await getToken.json()
            if (!getToken.ok) return res.status(500).json({msg: credentials.error});
            if (!fs.existsSync(YOUTUBE_CREDENTIALS)) fs.mkdirSync(YOUTUBE_CREDENTIALS)
            fs.writeFileSync(TOKEN_PATH, JSON.stringify(credentials));
            res.status(200).json({msg: "Token stored successfully"})
        } catch (err) {
            if (err instanceof Error)
            res.status(500).json({msg: err.message})
        }
    },
    uploadYoutube: async (expressRequest: Request, res: Response) => {
        try {
            const req = expressRequest as UserRequest;
            const base_url = `https://youtube.googleapis.com/youtube/v3/videos?part=snippet&part=status`;
            const {origin} = req.headers;
            if (!origin) return res.status(400).json({msg: 'Please make your origin visible!'})
            const validOrigin = await isGoogleAPI(origin);
            if (!validOrigin) return res.status(400).json({msg: "For access this API you need to use a specific domain!"})
            const {title,description,tags,categoryId,privacyStatus} = req.body;
            const videoFilePath = `${PUBLIC_PATH}/video1.mp4`;
            const thumbFilePath = `${PUBLIC_PATH}/image0.webp`;
            const auth = authorize();
            const headers = {
                'Authorization': `Bearer ${auth.access_token}`,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
            const body = JSON.stringify({
                snippet : {
                    title,
                    description,
                    tags,
                    categoryId,
                    defaultAudioLanguage: 'it',
                    defaultLanguage: 'it'
                },
                status: {
                    privacyStatus
                }
            })
            const response = await fetch(base_url, {
                method: 'post',
                headers,
                body
            })
            if (response.statusText === 'Unauthorized') {
                if (!auth.refresh_token) return res.status(400).json({msg: "Refresh token not found."})
                const newCredentials = await getAccessTokenWithRefreshToken(auth.refresh_token)
                console.log(newCredentials)
            } else {
                const text = await response.text()
                return res.status(403).json({msg: text})
            }
            // console.log(auth);
            // const youtube = google.youtube('v3')
            // const response = await youtube.videos.insert({
            //     auth,
            //     part: ['snippet,status'],
            //     requestBody: {
            //         snippet: {
            //             title,
            //             description,
            //             tags,
            //             categoryId,
            //             defaultAudioLanguage: 'it',
            //             defaultLanguage: 'it'
            //         },
            //         status: {
            //             privacyStatus
            //         },
            //     },
            //     media: {
            //         body: fs.createReadStream(videoFilePath)
            //     }
            // })
            // const {data} = response;
            // if (!data.id) return res.status(500).json({msg: "Missing videoId params."})
            // const response2 = await youtube.thumbnails.set({
            //     auth,
            //     videoId: data.id,
            //     media: {
            //         body: fs.createReadStream(thumbFilePath)
            //     }
            // })
            // if (!response2.data) return res.status(500).json({msg: "Video created, but received an error during the thumbnail upload's"})
            // fs.rm(PUBLIC_PATH, {recursive: true}, (err) => {
            //     if (err) return res.status(500).json({msg: "Cannot delete this folder"});
            //     res.status(201).json({videoInfo: data, msg: `Video and thumbnail updated successfully`})
            // })
        } catch(err) {
            if (err instanceof Error)
            res.status(500).json({msg: err.message, status: err.name})
        }
    },
}

export default youtubeCtrl;
