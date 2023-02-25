import { TUploadableMedia, TwitterApi } from 'twitter-api-v2';
import config from '../../config/config';
import _oauth from './twitter_oauth';
import { catchError } from '../../coraline/cor-route/crlerror';
import { getListInfo } from './twitter-config';
const oauthCallback = `${config.CLIENT_URL}/settings`; //redirect

const twitterapis = {
  oauth: _oauth(oauthCallback),
  uploadMedia: async (client: TwitterApi, media: TUploadableMedia) => {
    try {
      // const stats = fs.statSync(media);
      // const size = stats.size / (1024*1024)
      const mediaId = await client.v1.uploadMedia(media);
      return mediaId;
    } catch (err) {
      throw catchError(err);
    }
  },
  tweet: async (client: TwitterApi, text: string, mediaId?: string) => {
    try {
      if (text.length > 300) throw new Error(`Twitter accept maximum 300 words. Please consider making this tweet shorter!`);
      if (mediaId) {
        await client.v1.tweet(text, { media_ids: mediaId });
      } else {
        await client.v1.tweet(text);
      }
    } catch (err) {
      throw catchError(err);
    }
  },
  getTrendsLocations: async () => {
    try {
      const url = 'https://api.twitter.com/1.1/trends/available.json';
      const response = await twitterapis.oauth.getProtectedResource(url, 'GET', config.ANON_ACCESS_TOKEN, config.ANON_ACCESS_TOKEN_SECRET);
      return JSON.parse(response.data.toString());
    } catch (err) {
      throw catchError(err);
    }
  },
  getTrends: async (id = 1) => {
    try {
      const url = `https://api.twitter.com/1.1/trends/place.json?id=${id}`;
      const response = await twitterapis.oauth.getProtectedResource(url, 'GET', config.ANON_ACCESS_TOKEN, config.ANON_ACCESS_TOKEN_SECRET);
      return JSON.parse(response.data.toString());
    } catch (err) {
      throw catchError(err);
    }
  },
  getListTweets: async (access_token: string, access_token_secret: string, lang: 'en' | 'it') => {
    try {
      const { slug, owner_screen_name } = getListInfo(lang);
      const res = await twitterapis.oauth.getProtectedResource(
        `https://api.twitter.com/1.1/lists/statuses.json?slug=${slug}&owner_screen_name=${owner_screen_name}&tweet_mode=extended&count=100`,
        'GET',
        access_token,
        access_token_secret,
      );
      const data = JSON.parse(res.data.toString());
      if (!Array.isArray(data)) throw new Error('Invalid response from twitter!');
      return data as TweetProps[];
    } catch (err) {
      throw catchError(err);
    }
  },
};

export default twitterapis;
