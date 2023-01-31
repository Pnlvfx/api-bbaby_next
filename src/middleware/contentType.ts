import type { Response, NextFunction, Request } from 'express';

const contentType = (req: Request, res: Response, next: NextFunction) => {
  if (req.method === 'post') {
    if (!req.is('application/json')) {
      return res.status(400).json({ msg: 'You need to add Content Type as JSON in this API.' });
    }
  }
  next();
};

export default contentType;
