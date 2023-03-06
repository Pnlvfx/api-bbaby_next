import { TwitterApi } from 'twitter-api-v2';
import config from '../../config/config';
import { catchError } from '../../coraline/cor-route/crlerror';
import { getListInfo } from './twitter-config';
import { IUser, TokensProps } from '../../models/types/user';
import coraline from '../../coraline/coraline';

const twitterapis = {
  tweet: async (client: TwitterApi, text: string, mediaId?: string) => {
    try {
      if (text.length > 300) throw new Error(`Twitter accept maximum 300 words. Please consider making this tweet shorter!`);
      if (mediaId) {
        await client.v2.tweet(text, {
          media: {
            media_ids: [mediaId],
          },
        });
      } else {
        await client.v2.tweet(text);
      }
    } catch (err) {
      throw catchError(err);
    }
  },
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
  getMyClient: async (name: 'anonynewsitalia' | 'bugstransfer' | 'bbabystyle' | 'bbabyita') => {
    try {
      const keyPath = coraline.use('private_key');
      const filename = `${keyPath}/${name}.json`;
      const token = (await coraline.readJSON(filename)) as TokensProps;
      let client;
      if (Date.now() >= token.expires) {
        if (!token.refresh_token) throw new Error(`Missing refresh token for ${name}`);
        const c = new TwitterApi({ clientId: config.TWITTER_CLIENT_ID, clientSecret: config.TWITTER_CLIENT_SECRET });
        const t = await c.refreshOAuth2Token(token.refresh_token);
        const expires = Date.now() + t.expiresIn * 1000;
        await coraline.saveFile(filename, { access_token: t.accessToken, expires, refresh_token: t.refreshToken, provider: 'twitter' });
        client = t.client;
      } else {
        client = new TwitterApi(token.access_token);
      }
      return client;
    } catch (err) {
      throw catchError(err);
    }
  },
};

export default twitterapis;
