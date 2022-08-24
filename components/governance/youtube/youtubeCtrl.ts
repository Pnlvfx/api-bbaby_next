import type { Request, Response } from "express";
import { UserRequest } from "../../../@types/express";
import googleapis, { getAccessToken } from "../../../lib/googleapis";
import { catchError, catchErrorCtrl } from "../../../lib/common";
import {google} from 'googleapis'
import coraline  from "../../../database/coraline";
import config from '../../../config/config';
import fs from 'fs';

const {YOUTUBE_CLIENT_ID, YOUTUBE_CLIENT_SECRET} = config;

const checkOrigin = (req: Request, res: Response) => {
    const {origin} = req.headers;
    if (!origin) return res.status(400).json({msg: "This is an OAuth2 API so you need to acces it with a valid client!"});
    return origin;
}

const youtubeCtrl = {
    bbaby_youtubePageAuth: async (expressRequest: Request, res: Response) => {
        try {
            const req = expressRequest as UserRequest;
            const {origin} = req.headers;
            if (!origin) return res.status(400).json({msg: "This is an OAuth2 API so you need to acces it with a valid client!"});
            const credentials = await googleapis.checkTokenValidity();
            if (!credentials) return res.status(401).json({msg: "Your acces token is expired"});
            return res.status(200).json(true)
        } catch (err) {
            catchErrorCtrl(err, res)
        }
    },
    youtubeAccessToken: async (expressRequest: Request, res: Response) => {
        try {
            const req = expressRequest as UserRequest;
            const {code} = req.query;
            const origin = checkOrigin(req, res);
            const redirect_uri = `${origin}/governance`;
            if (!code) return res.status(400).json({msg: "No code find in your query."});
            const credentials = await getAccessToken({grant_type: 'authorization_code', code: code.toString(), redirect_uri});
            res.status(200).json({msg: "Token stored successfully"})
        } catch (err) {
            catchErrorCtrl(err, res)
        }
    },
    uploadYoutube: async (expressRequest: Request, res: Response) => {
        try {
            const req = expressRequest as UserRequest;
            const origin = checkOrigin(req, res);
            const {title,description,tags,categoryId,privacyStatus} = req.body;
            const credentials = await googleapis.checkTokenValidity();
            const youtubeFolder = await coraline.use('youtube');
            const videoFilePath =  `${youtubeFolder}/video1.mp4`;
            const thumbFilePath = `${youtubeFolder}/image0.webp`;
            if (!credentials.access_token) return;
            const {OAuth2} = google.auth;
            const oauth2Client = new OAuth2({
                clientId: YOUTUBE_CLIENT_ID,
                clientSecret: YOUTUBE_CLIENT_SECRET,
                redirectUri: `${origin}/governance`
            })
            oauth2Client.credentials = credentials;
            googleapis.youtube.insert(title, description, tags, categoryId, privacyStatus)
            // const youtube = google.youtube('v3')
            // const response = await youtube.videos.insert({
            //     auth: oauth2Client,
            //     part: ['snippet, status'],
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
            // console.log({data})
            // if (!data.id) return res.status(500).json({msg: "Missing videoId params."})
            // const response2 = await youtube.thumbnails.set({
            //     auth: credentials.access_token,
            //     videoId: data.id,
            //     media: {
            //         body: fs.createReadStream(thumbFilePath)
            //     }
            // })
            // if (!response2.data) return res.status(500).json({msg: "Video created, but received an error during the thumbnail upload's"})
            // // remember to clean the folder
            // res.status(201).json({videoInfo: data, msg: `Video and thumbnail updated successfully`})
        } catch (err) {
            catchErrorCtrl(err, res);
        }
    },
}

export default youtubeCtrl;
