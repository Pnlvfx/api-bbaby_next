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
    req.twitter = twitter;
    next();
  } catch (err) {
    catchErrorCtrl(err, res);
  }
};

export default twitterAuth;
