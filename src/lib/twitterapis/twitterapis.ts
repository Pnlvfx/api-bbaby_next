import { TwitterApi } from 'twitter-api-v2';
import { catchError } from '../../coraline/cor-route/crlerror';
import coraline from '../../coraline/coraline';
import v2 from './v2/v2';

const twitterapis = {
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
  getConfig: async () => {
    try {
      const keyPath = coraline.use('private_key');
      const config = await coraline.readJSON(`${keyPath}/twitter.json`);
      return config as TwitterConfig;
    } catch (err) {
      throw catchError(err);
    }
  },
  v2: v2,
};

export default twitterapis;
