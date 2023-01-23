import { TUploadableMedia, TwitterApi } from 'twitter-api-v2';
import config from '../../config/config';
import _oauth from '../twitter-oauth/twitter_oauth';
import { catchError } from '../../coraline/cor-route/crlerror';

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
      let response
      if (text.length > 300) throw new Error(`Twitter maximum accept maximum 300 words. Please consider making this tweet shorter!`);
      if (mediaId) {
        response = await client.v1.tweet(text, { media_ids: mediaId });
      } else {
        response = await client.v1.tweet(text);
      }
      return 'ok';
    } catch (err) {
      throw catchError(err);
    }
  },
  getTrendsLocations: async () => {
    try {
      const url = 'https://api.twitter.com/1.1/trends/available.json';
      const response = await twitterapis.oauth.getProtectedResource(url, 'GET', config.ANON_ACCESS_TOKEN, config.ANON_ACCESS_TOKEN_SECRET);
      return JSON.parse(response.data);
    } catch (err) {
      throw catchError(err);
    }
  },
  getTrends: async (id = 1) => {
    try {
      const url = `https://api.twitter.com/1.1/trends/place.json?id=${id}`;
      const response = await twitterapis.oauth.getProtectedResource(url, 'GET', config.ANON_ACCESS_TOKEN, config.ANON_ACCESS_TOKEN_SECRET);
      return JSON.parse(response.data);
    } catch (err) {
      throw catchError(err);
    }
  },
};

export default twitterapis;
