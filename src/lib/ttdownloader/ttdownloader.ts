import { Request, Response } from 'express';
import { catchError, catchErrorWithTelegram } from '../../coraline/cor-route/crlerror';
import coraline from '../../coraline/coraline';
import tiktokapis from '../tiktokapis/tiktokapis';
import telegramapis from '../telegramapis/telegramapis';
import { helpMessage, startMessage, successMessageArr, wrongMessage } from './messages';
const telegram = telegramapis(process.env.TIKTOK_TELEGRAM_TOKEN);

const ttdownloader = {
  use: async (base_url: string) => {
    try {
      await telegram.setWebHook(`${base_url}/bot${process.env.TIKTOK_TELEGRAM_TOKEN}`);
      await telegram.setMyCommands([
        { command: 'start', description: 'Start the bot' },
        { command: 'help', description: 'How to use' },
      ]);
    } catch (err) {
      throw catchError(err);
    }
  },
  processUpdate: async (req: Request, res: Response) => {
    res.sendStatus(200);
    try {
      const data = req.body as TelegramUpdate;
      if (data.message) {
        if (!data.message.text) return await telegram.sendMessage(data.message.chat.id, wrongMessage);
        if (data.message.text === '/start') {
          await telegram.sendMessage(data.message.chat.id, startMessage);
        } else if (data.message.text === '/help') {
          await telegram.sendMessage(data.message.chat.id, helpMessage);
        } else if (coraline.isUrl(data.message.text)) {
          const info = await tiktokapis.getInfo(data.message.text);
          if (info.video.url.no_wm) {
            await telegram.sendMessage(data.message.chat.id, 'Please wait...');
            await telegram.sendVideo(data.message.chat.id, info.video.url.no_wm, {
              caption: `${successMessageArr[coraline.getRandomInt(successMessageArr.length - 1)]} \n\n@tiktokdownloader97_bot`,
            });
            await coraline.sendLog('New video downloaded from TikTok telegram bot');
          } else return await telegram.sendMessage(data.message.chat.id, wrongMessage);
        } else return await telegram.sendMessage(data.message.chat.id, wrongMessage);
      }
    } catch (err) {
      catchErrorWithTelegram(err);
    }
  },
};

export default ttdownloader;
