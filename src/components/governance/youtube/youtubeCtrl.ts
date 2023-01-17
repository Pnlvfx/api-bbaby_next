import type { Request, Response } from 'express';
import { UserRequest } from '../../../@types/express';
import googleapis from '../../../lib/googleapis/googleapis';
import { google } from 'googleapis';
import coraline from '../../../coraline/coraline';
import config from '../../../config/config';
import fs from 'fs';
import { catchErrorCtrl } from '../../../coraline/cor-route/crlerror';

const { YOUTUBE_CLIENT_ID, YOUTUBE_CLIENT_SECRET } = config;

const youtubeCtrl = {
  youtubeAccessToken: async (expressRequest: Request, res: Response) => {
    try {
      const req = expressRequest as UserRequest;
      const { code } = req.query;
      const { origin } = req.headers;
      const redirect_uri = `${origin}/governance`;
      if (!code) return res.status(400).json({ msg: 'No code find in your query.' });
      await googleapis.OAuth2.getAccessToken('authorization_code', code.toString(), redirect_uri );
      res.status(200).json({ msg: 'Token stored successfully' });
    } catch (err) {
      catchErrorCtrl(err, res);
    }
  },
  uploadYoutube: async (expressRequest: Request, res: Response) => {
    try {
      const req = expressRequest as UserRequest;
      const { origin } = req.headers;
      const { title, description, tags, categoryId, privacyStatus } = req.body;
      const credentials = await googleapis.OAuth2.checkTokenValidity();
      const youtubeFolder = coraline.useStatic('youtube');
      const videoFilePath = `${youtubeFolder}/video1.mp4`;
      const thumbFilePath = `${youtubeFolder}/image0.webp`;
      const { OAuth2 } = google.auth;
      const oauth2Client = new OAuth2({
        clientId: YOUTUBE_CLIENT_ID,
        clientSecret: YOUTUBE_CLIENT_SECRET,
        redirectUri: `${origin}/governance`,
      });
      oauth2Client.credentials = credentials;
      //googleapis.youtube.insert(title, description, tags, categoryId, privacyStatus)
      const youtube = google.youtube('v3');
      const response = await youtube.videos.insert({
        auth: oauth2Client,
        part: ['snippet, status'],
        requestBody: {
          snippet: {
            title,
            description,
            tags,
            categoryId,
            defaultAudioLanguage: 'it',
            defaultLanguage: 'it',
          },
          status: {
            privacyStatus,
          },
        },
        media: {
          body: fs.createReadStream(videoFilePath),
        },
      });
      const { data } = response;
      if (!data.id) return res.status(500).json({ msg: 'Missing videoId params.' });
      const response2 = await youtube.thumbnails.set({
        auth: oauth2Client,
        videoId: data.id,
        media: {
          body: fs.createReadStream(thumbFilePath),
        },
      });
      if (!response2.data) return res.status(500).json({ msg: "Video created, but received an error during the thumbnail upload's" });
      // remember to clean the folder
      res.status(201).json({ videoInfo: data, msg: `Video and thumbnail updated successfully` });
    } catch (err) {
      catchErrorCtrl(err, res);
    }
  },
};

export default youtubeCtrl;
