import config from '../config/config.js';
import { errToString, TG_GROUP_LOG } from 'coraline';
import { Response } from 'express';
import telegramapis from 'telegramapis';
import { SendMessageOptions } from 'telegramapis/dist/esm/types/index.js';

export const telegram = telegramapis(config.TELEGRAM_TOKEN);

export const sendLog = async (message: string, options?: SendMessageOptions) => {
  try {
    console.log(message);
    await telegram.sendMessage(TG_GROUP_LOG, message, options);
  } catch (err) {
    console.log(errToString(err));
    console.log('Cannot send log!');
  }
};

export const catchErrorCtrl = (err: unknown, res: Response) => {
  console.log(err);
  const msg = errToString(err);
  sendLog(msg);
  res.status(500).json({ msg });
};
