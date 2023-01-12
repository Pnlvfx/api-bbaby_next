import rateLimit from 'express-rate-limit';
import coraline from '../coraline/coraline';

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
