import type { Request, Response } from "express";
import config from '../../config/config';
import { isGoogleAPI } from "../../lib/APIaccess";
import {google} from 'googleapis';
import { authorize, uploadVideo } from "./gov-functions/uploadYoutube";

const youtubeCtrl = {
    youtubeLogin: async (req: Request, res: Response) => {
        try {
            const {origin} = req.headers;
            const {YOUTUBE_CLIENT_ID,YOUTUBE_CLIENT_SECRET} = config;
            if (!origin) return res.status(400).json({msg: 'Please make your origin visible!'})
            const validOrigin = await isGoogleAPI(origin);
            if (!validOrigin) return res.status(400).json({msg: "For access this API you need to use a specific domain!"})
            const redirectUrl = `${origin}/governance/youtube`;
            const {OAuth2} = google.auth;
            const oauth2Client = new OAuth2(YOUTUBE_CLIENT_ID,YOUTUBE_CLIENT_SECRET,redirectUrl);
            const SCOPES = ['https://www.googleapis.com/auth/youtube.upload']
            const authUrl = oauth2Client.generateAuthUrl({
                access_type: 'offline',
                scope: SCOPES,
                prompt: 'consent',
            })
            res.status(200).json(authUrl);
        } catch (err) {
            if (err instanceof Error)
            res.status(500).json({msg: err.message})
        }
    },
    youtubeAccessToken: async (req: Request, res: Response) => {
        try {
            const {code} = req.query;
        } catch (err) {
            if (err instanceof Error)
            res.status(500).json({msg: err.message})
        }
    },
    uploadYoutube: async (req: Request, res: Response) => {
        try {
            const {title,description,tags,categoryId,privacyStatus} = req.body;
            const {origin} = req.headers;
            if (!origin) return res.status(400).json({msg: 'Please make your origin visible!'})
            const validOrigin = await isGoogleAPI(origin);
            if (!validOrigin) return res.status(400).json({msg: "For access this API you need to use a specific domain!"})
            authorize((auth:any) => uploadVideo(auth,title,description,tags,privacyStatus,res),res)
        } catch(err) {
            if (err instanceof Error)
            res.status(500).json({msg: err.message})
        }
    },
}

export default youtubeCtrl;
