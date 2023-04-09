import type { Response, NextFunction, Request } from 'express';
import type { UserRequest } from '../@types/express';
import { catchErrorCtrl } from '../coraline/cor-route/crlerror';
import userapis from '../lib/userapis/userapis';

const auth = async (expressRequest: Request, res: Response, next: NextFunction) => {
  try {
    const req = expressRequest as UserRequest;
    const { token } = req.cookies;
    const errorMessage = 'You need to login first!';
    if (!token) {
      res.statusMessage = errorMessage;
      return res.status(401).json({ msg: errorMessage });
    }
    const user = await userapis.getUserFromToken(req.cookies.token);
    if (!user) {
      res.statusMessage = errorMessage;
      return res.status(401).json({ msg: errorMessage });
    }
    req.user = user;
    next();
  } catch (err) {
    catchErrorCtrl(err, res);
  }
};

export default auth;
