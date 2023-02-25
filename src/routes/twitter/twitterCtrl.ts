import type { Request, Response } from 'express';
import type { TwitterRequest, UserRequest } from '../../@types/express';
import config from '../../config/config';
import User from '../../models/User';
import twitterapis from '../../lib/twitterapis/twitterapis';
import { catchErrorCtrl } from '../../coraline/cor-route/crlerror';
import userapis from '../../lib/userapis/userapis';

const COOKIE_NAME = 'oauth_token';
let access_token_secret = '';

let tweets: TweetProps[] | undefined;
let italianTweets: TweetProps[] | undefined;
let englishTweets: TweetProps[] | undefined;

const TwitterCtrl = {
  twitterReqToken: async (userRequest: Request, res: Response) => {
    try {
      const req = userRequest as UserRequest;
      if (!req.headers.origin) return res.status(400).json('You need to access this endpoint from a client!');
      if (req.headers.origin.startsWith('http://192'))
        return res.status(400).json({
          msg: 'Invalid origin, use https or localhost if you are in development',
        });
      const { oauth_token, oauth_token_secret } = await twitterapis.oauth.getOAuthRequestToken();
      if (!oauth_token) return res.status(500).json({ msg: 'Twitter error.' });
      const domain = userapis.getCookieDomain(req.headers.origin);
      access_token_secret = oauth_token_secret;
      res
        .status(200)
        .cookie(COOKIE_NAME, oauth_token, {
          maxAge: 15 * 60 * 1000, // 15 minutes
          secure: true,
          httpOnly: true,
          sameSite: true,
          domain,
        })
        .json({ oauth_token });
    } catch (err) {
      res.status(403).json({ msg: err });
    }
  },
  twitterAccessToken: async (expressRequest: Request, res: Response) => {
    try {
      const req = expressRequest as UserRequest;
      const { user } = req;
      const { oauth_token: req_oauth_token, oauth_verifier } = req.body;
      const oauth_token = req.cookies[COOKIE_NAME];
      const oauth_token_secret = access_token_secret;
      if (oauth_token !== req_oauth_token) {
        return res.status(403).json({ msg: 'Request token do not match' });
      }
      const { oauth_access_token, oauth_access_token_secret } = await twitterapis.oauth.getOauthAccessToken(
        oauth_token,
        oauth_token_secret,
        oauth_verifier,
      );
      user.tokens.push({
        access_token: oauth_access_token,
        access_token_secret: oauth_access_token_secret,
        provider: 'twitter',
      });
      await user.save();
      res.status(200).json({ success: true });
    } catch (err) {
      if (err instanceof Error) res.status(403).json({ message: err.message });
    }
  },
  twitterLogout: async (expressRequest: Request, res: Response) => {
    try {
      const req = expressRequest as UserRequest;
      const { user } = req;
      const oauth_token = await User.findOneAndUpdate(
        { username: user?.username },
        {
          $pull: {
            tokens: { provider: 'twitter' },
            externalAccounts: { provider: 'twitter' },
          },
        },
      );
      if (!oauth_token) return res.status(403).json({ msg: 'Missing, invalid, or expired tokens' });
      res.status(200).json({ success: true });
    } catch (err) {
      if (err instanceof Error) res.status(403).json({ msg: err.message });
    }
  },
  twitterUserInfo: async (expressRequest: Request, res: Response) => {
    try {
      const req = expressRequest as TwitterRequest;
      const { user, twitter } = req;
      const response = await twitterapis.oauth.getProtectedResource(
        `https://api.twitter.com/1.1/account/verify_credentials.json`,
        'GET',
        twitter.access_token,
        twitter.access_token_secret,
      );
      const twitterUser = JSON.parse(response.data.toString());
      const info = await User.findOneAndUpdate(
        { username: user?.username },
        {
          $push: {
            externalAccounts: {
              username: twitterUser.screen_name,
              provider: 'twitter',
              link: `https://www.twitter.com/${twitterUser.screen_name}`,
            },
          },
          hasExternalAccount: true,
        },
      );
      if (!info) return res.status(500).json({ msg: 'Something went wrong in bbaby database' });
      res.status(200).json(twitterUser);
    } catch (error) {
      res.status(403).json({ message: error });
    }
  },
  getList: async (expressRequest: Request, res: Response) => {
    try {
      const req = expressRequest as TwitterRequest;
      const { twitter } = req;
      const { lang } = req.query;
      if (!lang) return res.status(400).json({ msg: 'This API require a lang parameters.' });
      if (lang === 'it') {
        if (config.NODE_ENV === 'development' && italianTweets && italianTweets.length > 1) {
          res.status(200).json(italianTweets);
        } else {
          const { access_token, access_token_secret } = twitter;
          const data = await twitterapis.getListTweets(access_token, access_token_secret, lang);
          italianTweets = data;
          res.status(200).json(data);
        }
      } else if (lang === 'en') {
        if (config.NODE_ENV === 'development' && englishTweets && englishTweets.length > 1) {
          res.status(200).json(englishTweets);
        } else {
          const { access_token, access_token_secret } = twitter;
          const data = await twitterapis.getListTweets(access_token, access_token_secret, lang);
          englishTweets = data;
          res.status(200).json(data);
        }
      }
    } catch (error) {
      res.status(403).json({ message: error });
    }
  },
  getHome: async (expressRequest: Request, res: Response) => {
    try {
      if (config.NODE_ENV === 'development' && tweets && tweets.length > 1) {
        res.status(200).json(tweets);
      } else {
        const url = 'https://api.twitter.com/1.1/statuses/home_timeline.json?tweet_mode=extended&count=100';
        const response = await twitterapis.oauth.getProtectedResource(url, 'GET', config.ANON_ACCESS_TOKEN, config.ANON_ACCESS_TOKEN_SECRET);
        const data = JSON.parse(response.data.toString()) as TweetProps[];
        if (!Array.isArray(data)) return res.status(500).json({ msg: 'Invalid response from twitter!' });
        tweets = data;
        res.status(200).json(data);
      }
    } catch (err) {
      catchErrorCtrl(err, res);
    }
  },
  getUserTweets: async (expressRequest: Request, res: Response) => {
    try {
      const req = expressRequest as TwitterRequest;
      const { twitter } = req;
      const { screen_name } = req.params;
      const url = `https://api.twitter.com/1.1/statuses/user_timeline.json?screen_name=${screen_name}&tweet_mode=extended&count=100`;
      const response = await twitterapis.oauth.getProtectedResource(url, 'GET', twitter.access_token, twitter.access_token_secret);
      const data = JSON.parse(response.data.toString()) as TweetProps[];
      if (!Array.isArray(data)) return res.status(500).json({ msg: 'Invalid response from twitter!' });
      res.status(200).json(data);
    } catch (err) {
      catchErrorCtrl(err, res);
    }
  },
};

export default TwitterCtrl;
