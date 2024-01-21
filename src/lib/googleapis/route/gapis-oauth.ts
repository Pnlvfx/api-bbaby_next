import { GoogleCredentials } from '../types/credentials';
import config from '../../../config/config';
import coraline from 'coraline';

const gapiOAuth = {
  newOAuthUrl: (origin: string) => {
    const base_url = 'https://accounts.google.com/o/oauth2/v2/auth';
    const prompt = 'consent';
    const SCOPES = ['https://www.googleapis.com/auth/youtube.upload'];
    return `${base_url}?scope=${SCOPES}&prompt=${prompt}&response_type=code&client_id=${process.env.YOUTUBE_CLIENT_ID}&redirect_uri=${origin}&state=bbabystyle`;
  },
  getAccessToken: async (grant_type: 'authorization_code' | 'refresh_token', code: string, redirect_uri: string, refresh_token?: string) => {
    const { YOUTUBE_CLIENT_ID, YOUTUBE_CLIENT_SECRET } = config;
    const url = 'https://oauth2.googleapis.com/token';
    const headers = {
      'content-type': 'application/x-www-form-urlencoded',
    };
    let body;
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
    const res = await fetch(url, {
      method: 'post',
      headers,
      body,
    });
    if (!res.ok) throw new Error(res.status + res.statusText + 'Error while trying to get a new token!');
    const tokenPath = coraline.use('token');
    const file = `${tokenPath}/youtube_token.json`;
    const credentials = (await res.json()) as GoogleCredentials;
    if (credentials.expires_in) {
      credentials.expires = Date.now() / 1000 + credentials.expires_in;
    }
    await coraline.saveFile(file, JSON.stringify(credentials));
    //delete after 1 hour
    coraline.runAtSpecificTime(
      1,
      0,
      async () => {
        await coraline.rm(file);
      },
      false,
    );
    //
    return credentials;
  },
  checkTokenValidity: async () => {
    const tokenPath = coraline.use('token');
    const file = `${tokenPath}/youtube_token.json`;
    const credentials = await coraline.readJSON<GoogleCredentials>(file);
    const now = Date.now() / 1000;
    if (credentials.expires && now > credentials?.expires) throw new Error('Your access token is expired, you need to get a new one!');
    return credentials;
  },
};

export default gapiOAuth;
