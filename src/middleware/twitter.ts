import type { Response, NextFunction, Request } from 'express';
import type { TwitterRequest } from '../@types/express';
import { catchErrorCtrl } from '../coraline/cor-route/crlerror';

const twitterAuth = async (expressRequest: Request, res: Response, next: NextFunction) => {
  try {
    const req = expressRequest as TwitterRequest;
    const { user } = req;
    const twitter = user.tokens?.find((provider) => provider.provider === 'twitter');
    if (!twitter)
      return res.status(401).json({
        msg: 'You need to connect your twitter account to access this page!',
      });
    if (!twitter.access_token || !twitter.access_token_secret) return res.status(400).json({ msg: 'Please, try to login to twitter again!' });
    req.twitter = twitter;
    next();
  } catch (err) {
    catchErrorCtrl(err, res);
  }
};

export default twitterAuth;
