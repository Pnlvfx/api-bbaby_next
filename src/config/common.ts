import rateLimit from 'express-rate-limit';

export const limiter = rateLimit({
  windowMs: 40, //seconds
  max: 1,
  message: 'Suck useEffect',
  standardHeaders: true,
  legacyHeaders: false,
});
