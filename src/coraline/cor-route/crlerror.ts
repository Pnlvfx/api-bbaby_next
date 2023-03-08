import type { Response } from 'express';
import coraline from '../coraline';

export const catchError = (err: unknown, ...args: string[]): void => {
  if (args) {
    args.map((value) => {
      err += ' ' + value;
    });
  }
  if (err instanceof Error) new Error(`${err.message}`);
  else if (typeof err === 'string') new Error(err);
  else new Error(`API error`);
};

export const catchErrorCtrl = (err: unknown, res: Response) => {
  console.log(err);
  if (err instanceof Error) res.status(500).json({ msg: err.message });
  else if (typeof err === 'string') res.status(500).json({ msg: err });
  else res.status(500).json({ msg: 'API error' });
};

export const catchErrorWithTelegram = async (err: unknown) => {
  try {
    console.log(err);
    if (err instanceof Error) {
      await coraline.sendLog(process.env.NODE_ENV + ' ' + err.message);
    } else if (typeof err === 'string') {
      await coraline.sendLog(process.env.NODE_ENV + ' ' + err);
    } else await coraline.sendLog('Unknown error');
  } catch (err) {
    return;
  }
};
