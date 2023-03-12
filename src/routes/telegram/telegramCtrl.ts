import { Request, Response } from 'express';
import { apiconfig } from '../../config/APIconfig';
import { checkUpdateType } from '../../lib/telegramapis/hooks/telegramhooks';
import { newPostFromTG } from './hooks/tg-hooks';
import { catchErrorWithTelegram } from '../../coraline/cor-route/crlerror';

const telegramCtrl = {
  processUpdate: async (req: Request, res: Response) => {
    res.sendStatus(200);
    try {
      const data = req.body as TelegramUpdate;
      console.log(data.message?.text);
      const check = checkUpdateType(data);
      if (check === 'message') {
        if (data.message?.chat.id === apiconfig.telegram.my_chat_id) {
          const msg = data.message as TelegramMessage;
          if (msg.text) {
            if (msg.reply_to_message) {
              await newPostFromTG(msg.text);
            }
          }
        }
      } else {
        const info = data.callback_query as TelegramCallbackQuery;
        if (info.data === 'post' && info.message.text) {
          await newPostFromTG(info.message.text);
        }
      }
    } catch (err) {
      catchErrorWithTelegram(err);
    }
  },
};

export default telegramCtrl;
