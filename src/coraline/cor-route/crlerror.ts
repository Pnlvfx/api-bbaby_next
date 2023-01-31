import type { Response } from 'express';

export const catchError = (err: unknown) => {
  if (err instanceof Error) throw new Error(`${err.message}`);
  else if (typeof err === 'string') throw new Error(err);
  else throw new Error(`API error`);
};

export const catchErrorCtrl = (err: unknown, res: Response) => {
  if (err instanceof Error) res.status(500).json({ msg: err.message });
  else if (typeof err === 'string') res.status(500).json({ msg: err });
  else res.status(500).json({ msg: 'API error' });
};
