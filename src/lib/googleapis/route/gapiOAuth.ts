import { catchError } from '../../../coraline/cor-route/crlerror';
import coraline from '../../../coraline/coraline';
import { GoogleCredentials } from '../types/credentials';
import config from '../../../config/config';

const gapiOAth = {
  newGoogleOAuthUrl: (origin: string) => {
    const base_url = 'https://accounts.google.com/o/oauth2/v2/auth';
    const prompt = 'consent';
    const SCOPES = ['https://www.googleapis.com/auth/youtube.upload'];
    const googleAuth = `${base_url}?scope=${SCOPES}&prompt=${prompt}&response_type=code&client_id=${process.env.YOUTUBE_CLIENT_ID}&redirect_uri=${origin}&state=bbabystyle`;
    return googleAuth;
  },
  getAccessToken: async (grant_type: 'authorization_code' | 'refresh_token', code: string, redirect_uri: string, refresh_token?: string) => {
    try {
      const { YOUTUBE_CLIENT_ID, YOUTUBE_CLIENT_SECRET } = config;
      const url = 'https://oauth2.googleapis.com/token';
      const headers = {
        'content-type': 'application/x-www-form-urlencoded',
      };
      let body = null;
      if (code && redirect_uri) {
        body = new URLSearchParams({
          client_id: YOUTUBE_CLIENT_ID,
          client_secret: YOUTUBE_CLIENT_SECRET,
          grant_type,
          code,
          redirect_uri,
        });
      } else if (refresh_token) {
        body = new URLSearchParams({
          client_id: YOUTUBE_CLIENT_ID,
          client_secret: YOUTUBE_CLIENT_SECRET,
          grant_type,
          refresh_token,
        });
      }
      const response = await fetch(url, {
        method: 'post',
        headers,
        body,
      });
      if (!response.ok) throw new Error(response.status + response.statusText + 'Error while trying to get a new token!');
      const tokenPath = coraline.use('token');
      const file = `${tokenPath}/youtube_token.json`;
      const credentials = (await response.json()) as GoogleCredentials;
      if (credentials.expires_in) {
        credentials.expires = Date.now() / 1000 + credentials.expires_in;
      }
      await coraline.saveFile(file, credentials);
      //delete after 1 hour
      coraline.runAtSpecificTime(
        1,
        0,
        async () => {
          await coraline.deleteFile(file);
        },
        false,
      );
      //
      return credentials;
    } catch (err) {
      throw catchError(err);
    }
  },
  checkTokenValidity: async () => {
    try {
      const tokenPath = coraline.use('token');
      const file = `${tokenPath}/youtube_token.json`;
      let credentials: GoogleCredentials;
      try {
        credentials = await coraline.readJSON(file);
        const now = Date.now() / 1000;
        if (credentials.expires && now > credentials?.expires) throw catchError('Your access token is expired, you need to get a new one!');
      } catch (err) {
        throw catchError('Your access token is expired, you need to get a new one!');
      }
      return credentials;
    } catch (err) {
      throw catchError(err);
    }
  },
};

export default gapiOAth;
