import type { Response } from 'express';
import rateLimit from 'express-rate-limit';
import coraline from '../coraline/coraline';

export const catchError = (err: unknown) => {
  if (err instanceof Error) {
    throw new Error(`${err.message}`);
  } else if (typeof err === 'string') {
    throw new Error(err);
  } else {
    throw new Error(`API error`);
  }
};

export const catchErrorCtrl = (err: unknown, res: Response, from: string) => {
  if (err instanceof Error) {
    coraline.sendLog(err.message + ' ' + from).then(() => {
      res.status(500).json({ msg: err.message });
    });
  } else if (typeof err === 'string') {
    coraline.sendLog(err + ' ' + from).then(() => {
      res.status(500).json({ msg: err });
    });
  } else {
    coraline.sendLog('API ERROR' + ' ' + from).then(() => {
      res.status(500).json({ msg: 'API error' });
    });
  }
};

export const catchErrorWithTelegram = (err: unknown) => {
  if (err instanceof Error) {
    coraline.sendLog(err.message);
  } else if (typeof err === 'string') {
    coraline.sendLog(err);
  } else {
    coraline.sendLog('Unknown error');
  }
};

export const limiter = rateLimit({
  windowMs: 40, //seconds
  max: 1,
  message: 'Suck useEffect',
  standardHeaders: true,
  legacyHeaders: false,
});
