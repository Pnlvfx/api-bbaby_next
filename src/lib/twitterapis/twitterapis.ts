import { IParsedOAuth2TokenResult, TwitterApi } from 'twitter-api-v2';
import config from '../../config/config';
import { catchError } from '../../coraline/cor-route/crlerror';
import { getListInfo } from './twitter-config';
import { IUser, TokensProps } from '../../models/types/user';
import coraline from '../../coraline/coraline';
import { URLSearchParams } from 'url';

const twitterapis = {
  getListTweets: async (lang: 'en' | 'it') => {
    try {
      const id = getListInfo(lang);
      const client = new TwitterApi(config.TWITTER_BEARER_TOKEN);
      const data = await client.v2.listTweets(id, {
        expansions: ['author_id', 'attachments.media_keys'],
        'tweet.fields': ['public_metrics', 'entities', 'created_at'],
        'user.fields': ['username', 'name', 'profile_image_url'],
        'media.fields': ['type', 'url', 'width', 'height', 'preview_image_url', 'variants'],
        max_results: 100,
      });
      return data;
    } catch (err) {
      throw catchError(err);
    }
  },
  getUserClient: async (twitter: TokensProps, user: IUser) => {
    try {
      let client;
      if (Date.now() >= twitter.expires) {
        if (!twitter.refresh_token) throw new Error('Your token is expired, you need to login to twitter again');
        const c = new TwitterApi({ clientId: config.TWITTER_CLIENT_ID, clientSecret: config.TWITTER_CLIENT_SECRET });
        const token = await c.refreshOAuth2Token(twitter.refresh_token);
        const index = user.tokens.findIndex((p) => p.provider === 'twitter');
        user.tokens[index] = {
          access_token: token.accessToken,
          expires: Date.now() + token.expiresIn,
          provider: 'twitter',
          refresh_token: token.refreshToken,
        };
        await user.save();
        client = token.client;
      } else {
        client = new TwitterApi(twitter.access_token);
      }
      return client;
    } catch (err) {
      throw catchError(err);
    }
  },
  getMyClient: async (name: 'anonynewsitaly' | 'bugstransfer' | 'bbabystyle' | 'bbabyita') => {
    try {
      const config = await twitterapis.getConfig();
      const credentials = config.v1.users.find((u) => u.name === name);
      if (!credentials) throw new Error('Twitter: Missing admin access token');
      const client = new TwitterApi({
        appKey: config.v1.key,
        appSecret: config.v1.secret,
        accessToken: credentials.access_token,
        accessSecret: credentials.access_token_secret,
      });
      return client;
    } catch (err) {
      throw catchError(err);
    }
  },
  refreshToken: async (refresh_token: string) => {
    try {
      const url = 'https://api.twitter.com/oauth2/token';
      const encondedHeader = Buffer.from(`${config.TWITTER_CLIENT_ID}:${config.TWITTER_CLIENT_SECRET}`).toString('base64');
      const body = new URLSearchParams();
      body.append('grant_type', 'refresh_token');
      body.append('refresh_token', refresh_token);
      const res = await fetch(url, {
        method: 'POST',
        headers: { authorization: `Basic ${encondedHeader}`, 'Content-Type': 'application/x-www-form-urlencoded' },
        body,
      });
      const data = await res.json();
      console.log(data, 'twitter refresh token');
      if (!res.ok) throw new Error(data?.errors[0].message);
      return data as IParsedOAuth2TokenResult;
    } catch (err) {
      throw catchError(err);
    }
  },
  getConfig: async () => {
    try {
      const keyPath = coraline.use('private_key');
      const config = await coraline.readJSON(`${keyPath}/twitter.json`);
      return config as TwitterConfig;
    } catch (err) {
      throw catchError(err);
    }
  },
};

export default twitterapis;
