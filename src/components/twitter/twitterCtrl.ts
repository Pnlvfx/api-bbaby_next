import type { Request, Response } from 'express';
import type { UserRequest } from '../../@types/express';
import config from '../../config/config';
import User from '../../models/User';
import twitterapis from '../../lib/twitterapis/twitterapis';
import { catchErrorCtrl } from '../../coraline/cor-route/crlerror';
import userapis from '../../lib/userapis/userapis';
const COOKIE_NAME = 'oauth_token';
let access_token_secret = '';

let tweets: TweetProps[];
let italianTweets: TweetProps[];
let englishTweets: TweetProps[];

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
        oauth_access_token,
        oauth_access_token_secret,
        provider: 'twitter',
      });
      await user.save();
      res.status(200).json({ success: true });
    } catch (err) {
      if (err instanceof Error) res.status(403).json({ message: err.message });
    }
  },
  twitterUserInfo: async (expressRequest: Request, res: Response) => {
    try {
      const req = expressRequest as UserRequest;
      const internalUser = req.user;
      const twitter = internalUser?.tokens?.find((provider) => provider.provider === 'twitter');
      if (!twitter)
        return res.status(500).json({
          msg: "Sorry. We can't find your twitter account. Have you associated it in your User Settings page?",
        });
      const { oauth_access_token, oauth_access_token_secret } = twitter;
      if (!oauth_access_token || !oauth_access_token_secret) return res.status(500).json({ msg: 'Please, try to login to twitter again!' });
      const response = await twitterapis.oauth.getProtectedResource(
        `https://api.twitter.com/1.1/account/verify_credentials.json`,
        'GET',
        oauth_access_token,
        oauth_access_token_secret,
      );
      const user = JSON.parse(response.data.toString());
      const info = await User.findOneAndUpdate(
        { username: internalUser?.username },
        {
          $push: {
            externalAccounts: {
              username: user.screen_name,
              provider: 'twitter',
              link: `https://www.twitter.com/${user.screen_name}`,
            },
          },
          hasExternalAccount: true,
        },
      );
      if (!info) return res.status(500).json({ msg: 'Something went wrong in bbaby database' });
      res.json(user);
    } catch (error) {
      res.status(403).json({ message: error });
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
  twitterGetUserPost: async (expressRequest: Request, res: Response) => {
    try {
      const req = expressRequest as UserRequest;
      const { user } = req;
      const twitter = user.tokens?.find((provider) => provider.provider === 'twitter');
      if (!twitter)
        return res.status(401).json({
          msg: 'You need to connect your twitter account to access this page!',
        });
      const { oauth_access_token, oauth_access_token_secret } = twitter;
      if (!oauth_access_token || !oauth_access_token_secret) return res.status(400).json({ msg: 'Please, try to login to twitter again!' });
      const { limit, skip, slug, owner_screen_name } = req.query;
      if (!limit || !skip) return res.status(400).json({ msg: 'You need to use pagination parameters for this API to work!' });
      if (!slug || !owner_screen_name)
        return res.status(400).json({
          msg: 'This API require a slug parameter and an owner_screen_name.',
        });
      const _skip = Number(skip);
      const _limit = Number(limit);
      if (owner_screen_name === 'Bbabystyle') {
        if ((process.env.NODE_ENV === 'production' && _limit === 15) || (process.env.NODE_ENV === 'development' && !italianTweets)) {
          console.log('new request');
          if (process.env.NODE_ENV === 'development') {
            console.log('In development new tweets get requested only after each restart, otherwise they stay always the same!');
          }
          const url = `https://api.twitter.com/1.1/lists/statuses.json?slug=${slug}&owner_screen_name=${owner_screen_name}&tweet_mode=extended&count=100`;
          const response = await twitterapis.oauth.getProtectedResource(url, 'GET', oauth_access_token, oauth_access_token_secret);
          const data = JSON.parse(response.data.toString());
          if (!Array.isArray(data)) return res.status(500).json({ msg: 'Invalid response from twitter!' });
          italianTweets = data;
        }
        const tt = italianTweets.slice(_skip, _skip + _limit);
        res.status(200).json(tt);
      } else {
        if ((process.env.NODE_ENV === 'production' && _limit === 15) || (process.env.NODE_ENV === 'development' && !englishTweets)) {
          console.log('new request');
          if (process.env.NODE_ENV === 'development') {
            console.log('In development new tweets get requested only after each restart, otherwise they stay always the same!');
          }
          const url = `https://api.twitter.com/1.1/lists/statuses.json?slug=${slug}&owner_screen_name=${owner_screen_name}&tweet_mode=extended&count=100`;
          const response = await twitterapis.oauth.getProtectedResource(url, 'GET', oauth_access_token, oauth_access_token_secret);
          const data = JSON.parse(response.data.toString());
          if (!Array.isArray(data)) return res.status(500).json({ msg: 'Invalid response from twitter!' });
          englishTweets = data;
        }
        const tt = englishTweets.slice(_skip, _skip + _limit);
        res.status(200).json(tt);
      }
    } catch (error) {
      res.status(403).json({ message: error });
    }
  },
  getHome: async (expressRequest: Request, res: Response) => {
    try {
      const req = expressRequest as UserRequest;
      const { user } = req;
      const twitter = user.tokens?.find((provider) => provider.provider === 'twitter');
      if (!twitter)
        return res.status(401).json({
          msg: 'You need to connect your twitter account to access this page!',
        });
      if (!twitter.oauth_access_token || !twitter.oauth_access_token_secret)
        return res.status(400).json({ msg: 'Please, try to login to twitter again!' });
      const { limit, skip } = req.query;
      if (!limit || !skip) return res.status(400).json({ msg: 'You need to use pagination parameters for this API to work!' });
      const _skip = Number(skip);
      const _limit = Number(limit);
      if ((process.env.NODE_ENV === 'production' && _limit === 15) || (process.env.NODE_ENV === 'development' && !tweets)) {
        console.log('new request');
        if (process.env.NODE_ENV === 'development') {
          console.log('In development new tweets get requested only after each restart, otherwise they stay always the same!');
        }
        const url = 'https://api.twitter.com/1.1/statuses/home_timeline.json?tweet_mode=extended&count=100';
        const response = await twitterapis.oauth.getProtectedResource(url, 'GET', config.ANON_ACCESS_TOKEN, config.ANON_ACCESS_TOKEN_SECRET);
        const data = JSON.parse(response.data.toString()) as TweetProps[];
        if (!Array.isArray(data)) return res.status(500).json({ msg: 'Invalid response from twitter!' });
        tweets = data;
      }
      const response = tweets.slice(_skip, _skip + _limit);
      res.status(200).json(response);
    } catch (err) {
      catchErrorCtrl(err, res);
    }
  },
};

export default TwitterCtrl;
