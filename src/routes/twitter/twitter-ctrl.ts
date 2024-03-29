import type { Request, Response } from 'express';
import type { TwitterRequest, UserRequest } from '../../@types/express';
import config from '../../config/config';
import twitterapis from '../../lib/twitterapis/twitterapis';
import { MediaObjectV2, TweetV2, TwitterApi, UserV2 } from 'twitter-api-v2';
import { catchErrorCtrl } from '../../lib/telegram';
let codeVerifier = '';

interface TweetResponse {
  data: TweetV2[];
  users: UserV2[];
  media: MediaObjectV2[];
}

let tweets: TweetResponse | undefined;
let italianTweets: TweetResponse | undefined;
let englishTweets: TweetResponse | undefined;

const twitterCtrl = {
  generateOAuthUrl: async (userRequest: Request, res: Response) => {
    try {
      const req = userRequest as UserRequest;
      const { origin } = req.headers;
      if (!origin) return res.status(400).json({ msg: 'Cannot access this endpoint without a valid origin!' });
      const oauthCallback = `${origin}/settings`;
      const client = new TwitterApi({
        clientId: config.TWITTER_CLIENT_ID,
        clientSecret: config.TWITTER_CLIENT_SECRET,
      });
      const oauth = client.generateOAuth2AuthLink(oauthCallback, {
        scope: ['tweet.read', 'tweet.write', 'offline.access', 'users.read', 'list.read'],
      });
      codeVerifier = oauth.codeVerifier;
      res.status(200).json(oauth.url);
    } catch (err) {
      catchErrorCtrl(err, res);
    }
  },
  accessToken: async (userRequest: Request, res: Response) => {
    try {
      const req = userRequest as UserRequest;
      const { user, headers, query } = req;
      const { origin } = headers;
      if (!origin) return res.status(400).json({ msg: 'Cannot access this endpoint without a valid origin!' });
      const oauthCallback = `${origin}/settings`;
      const client = new TwitterApi({
        clientId: config.TWITTER_CLIENT_ID,
        clientSecret: config.TWITTER_CLIENT_SECRET,
      });
      const { code } = query;
      if (!code || !codeVerifier) return res.status(400).json({ msg: "Missing required paramd: 'code'" });
      const token = await client.loginWithOAuth2({
        code: code.toString(),
        redirectUri: oauthCallback,
        codeVerifier,
      });
      const twitterUser = await token.client.v2.me();
      user.externalAccounts = [
        {
          username: twitterUser.data.username,
          provider: 'twitter',
          link: `https://www.twitter.com/${twitterUser.data.username}`,
        },
      ];
      const expires = Date.now() + token.expiresIn * 1000;
      user.tokens.push({
        access_token: token.accessToken,
        expires,
        refresh_token: token.refreshToken,
        provider: 'twitter',
      });
      user.hasExternalAccount = true;
      await user.save();
      res.status(200).json(twitterUser);
    } catch (err) {
      catchErrorCtrl(err, res);
    }
  },
  twitterLogout: async (userRequest: Request, res: Response) => {
    try {
      const req = userRequest as UserRequest;
      const { user } = req;
      user.tokens = user.tokens.filter((t) => t.provider !== 'twitter');
      user.externalAccounts = user.externalAccounts.filter((t) => t.provider !== 'twitter');
      await user.save();
      res.status(200).json({ success: true });
    } catch (err) {
      catchErrorCtrl(err, res);
    }
  },
  getList: async (expressRequest: Request, res: Response) => {
    try {
      const req = expressRequest as TwitterRequest;
      const { lang } = req.query;
      if (!lang) return res.status(400).json({ msg: 'This API require a lang parameters.' });
      if (lang === 'it') {
        if (config.NODE_ENV === 'development' && italianTweets) return res.status(200).json(italianTweets);
        const data = await twitterapis.v2.getListTweets(lang);
        italianTweets = {
          data: data.tweets,
          users: data.includes.users,
          media: data.includes.media,
        };
        res.status(200).json(italianTweets);
      } else if (lang === 'en') {
        if (config.NODE_ENV === 'development' && englishTweets) return res.status(200).json(englishTweets);
        const data = await twitterapis.v2.getListTweets(lang);
        englishTweets = {
          data: data.tweets,
          users: data.includes.users,
          media: data.includes.media,
        };
        res.status(200).json(englishTweets);
      } else return res.status(400).json({ msg: "Bad language code, the options are: 'it' or 'en'" });
    } catch (error) {
      res.status(403).json({ message: error });
    }
  },
  getHome: async (twitterRequest: Request, res: Response) => {
    try {
      if (config.NODE_ENV === 'development' && tweets) return res.status(200).json(tweets);
      const req = twitterRequest as TwitterRequest;
      const { user, twitter } = req;
      const client = await twitterapis.v2.getUserClient(twitter, user);
      const data = await client.v2.homeTimeline({
        expansions: ['author_id', 'attachments.media_keys'],
        'tweet.fields': ['public_metrics', 'entities', 'created_at'],
        'user.fields': ['username', 'name', 'profile_image_url'],
        'media.fields': ['type', 'url', 'width', 'height', 'preview_image_url', 'variants'],
        max_results: 100,
      });
      tweets = {
        data: data.tweets,
        users: data.includes.users,
        media: data.includes.media,
      };
      res.status(200).json(tweets);
    } catch (err) {
      catchErrorCtrl(err, res);
    }
  },
  getUserTweets: async (twitterRequest: Request, res: Response) => {
    try {
      const req = twitterRequest as TwitterRequest;
      const { user, twitter, params } = req;
      const client = await twitterapis.v2.getUserClient(twitter, user);
      const { id } = params;
      const data = await client.v2.userTimeline(id, {
        expansions: ['author_id', 'attachments.media_keys'],
        'tweet.fields': ['public_metrics', 'entities', 'created_at'],
        'user.fields': ['username', 'name', 'profile_image_url'],
        'media.fields': ['type', 'url', 'width', 'height', 'preview_image_url', 'variants'],
        max_results: 100,
      });
      res.status(200).json({
        data: data.tweets,
        users: data.includes.users,
        media: data.includes.media,
      });
    } catch (err) {
      catchErrorCtrl(err, res);
    }
  },
};

export default twitterCtrl;
