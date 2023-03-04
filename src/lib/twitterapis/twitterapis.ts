import { TwitterApi } from 'twitter-api-v2';
import config from '../../config/config';
import { catchError } from '../../coraline/cor-route/crlerror';
import { getListInfo } from './twitter-config';
const oauthCallback = `${config.CLIENT_URL}/settings`;

const twitterapis = {
  getOAuthRequestToken: async () => {
    try {
      const client = new TwitterApi({
        appKey: config.TWITTER_CONSUMER_KEY,
        appSecret: config.TWITTER_CONSUMER_SECRET,
      });
      const { oauth_token, oauth_token_secret } = await client.generateAuthLink(oauthCallback);
      return { oauth_token, oauth_token_secret };
    } catch (err) {
      throw catchError(err);
    }
  },
  getOauthAccessToken: async (oauth_token: string, oauth_token_secret: string, oauth_verifier: string) => {
    try {
      const client = new TwitterApi({
        appKey: config.TWITTER_CONSUMER_KEY,
        appSecret: config.TWITTER_CONSUMER_SECRET,
        accessToken: oauth_token,
        accessSecret: oauth_token_secret,
      });
      const { accessToken, accessSecret } = await client.login(oauth_verifier);
      return { oauth_access_token: accessToken, oauth_access_token_secret: accessSecret };
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
  getListTweets: async (access_token: string, access_token_secret: string, lang: 'en' | 'it') => {
    try {
      const { slug, owner_screen_name } = getListInfo(lang);
      const client = new TwitterApi({
        appKey: config.TWITTER_CONSUMER_KEY,
        appSecret: config.TWITTER_CONSUMER_SECRET,
        accessToken: access_token,
        accessSecret: access_token_secret,
      });
      const data = await client.v1.listStatuses({ slug, owner_screen_name });
      return data.tweets;
    } catch (err) {
      throw catchError(err);
    }
  },
};

export default twitterapis;
