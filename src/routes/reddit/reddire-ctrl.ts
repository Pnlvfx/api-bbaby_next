import type { Request, Response } from 'express';
import type { UserRequest } from '../../@types/express';
import config from '../../config/config';
import redditapis from '../../lib/redditapis/redditapis';
import User from '../../models/user';
import { catchErrorCtrl } from '../../lib/telegram';

const USER_AGENT = `bbabysyle/1.0.0 (www.bbabytyle.com)`;

const redditCtrl = {
  login: async (expressRequest: Request, res: Response) => {
    try {
      const req = expressRequest as UserRequest;
      const { user, headers, query } = req;
      const { REDDIT_CLIENT_ID, REDDIT_CLIENT_SECRET } = config;
      const { origin } = headers;
      if (!origin) return res.status(400).json({ msg: 'Make sure to access this API from www.bbabystyle.com' });
      if (!origin.includes('www.bbabystyle.com')) return res.status(400).json({ msg: 'Make sure to access this API from www.bbabystyle.com' });
      const { code } = query;
      if (!code) return res.status(500).json({ msg: 'No code find!' });
      const encondedHeader = Buffer.from(`${REDDIT_CLIENT_ID}:${REDDIT_CLIENT_SECRET}`).toString('base64');
      let response = await fetch(`https://www.reddit.com/api/v1/access_token`, {
        method: 'POST',
        body: `grant_type=authorization_code&code=${code}&redirect_uri=${origin}/settings`,
        headers: {
          authorization: `Basic ${encondedHeader}`,
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': USER_AGENT,
        },
      });
      if (!response.ok)
        return res.status(500).json({ msg: 'For some reason reddit have refused your credentials. Please try to contact reddit support.' });
      const body = await response.json();
      const access_token_expiration = 3600;
      const saveToken = await User.findOneAndUpdate(
        { username: user.username },
        { $push: { tokens: { access_token: body.access_token, refresh_token: body.refresh_token, provider: 'reddit', access_token_expiration } } },
      );
      if (!saveToken) return res.status(500).json({ msg: 'Something went wrong, please try again' });
      response = await fetch(`https://oauth.reddit.com/api/v1/me`, {
        method: 'GET',
        headers: { authorization: `bearer ${body.access_token}`, 'User-Agent': USER_AGENT },
      });
      const redditUser = await response.json();
      const { verified, name } = redditUser;
      if (!verified) return res.status(400).json({ msg: 'You need to verify your Reddit account to continue!' });
      const updateUser = await User.findOneAndUpdate(
        { username: user.username },
        { $push: { externalAccounts: { username: name, provider: 'reddit' } }, hasExternalAccount: true },
      );
      if (!updateUser) return res.status(500).json({ msg: 'Something went wrong, please try again.' });
      res.status(200).json({ msg: true });
    } catch (err) {
      if (err instanceof Error) res.status(500).json({ msg: err.message });
    }
  },
  logout: async (expressRequest: Request, res: Response) => {
    try {
      const req = expressRequest as UserRequest;
      const { user } = req;
      const oauth_token = await User.findOneAndUpdate(
        { username: user.username },
        { $pull: { tokens: { provider: 'reddit' }, externalAccounts: { provider: 'reddit' } } },
      );
      if (!oauth_token) return res.status(403).json({ msg: 'Missing, invalid, or expired tokens' });
      res.status(200).json({ success: true });
    } catch (err) {
      if (err instanceof Error) res.status(403).json({ msg: err.message });
    }
  },
  getPosts: async (expressRequest: Request, res: Response) => {
    try {
      const req = expressRequest as UserRequest;
      const { user, query } = req;
      const { after, count } = query;
      const redditTokens = user?.tokens?.find((provider) => provider.provider === 'reddit');
      if (!redditTokens?.expires) return res.status(500).json({ msg: 'You are not authorized to see this content.' });
      if (Date.now() >= redditTokens.expires) {
        await redditapis.getNewToken(redditTokens);
      }
      const posts = await redditapis.getPostsWithToken(redditTokens.access_token, after?.toString(), count?.toString());
      res.status(200).json(posts);
    } catch (err) {
      catchErrorCtrl(err, res);
    }
  },
};

export default redditCtrl;
