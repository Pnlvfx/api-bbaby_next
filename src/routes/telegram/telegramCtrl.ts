import { Request, Response } from 'express';
import { apiconfig } from '../../config/APIconfig';
import { newPostFromTG } from './hooks/tg-hooks';
import { catchErrorWithTelegram } from '../../coraline/cor-route/crlerror';
import telegramapis from '../../lib/telegramapis/telegramapis';
const confirmMessage = 'Are you sure that you want to share this?';

const telegramCtrl = {
  processUpdate: async (req: Request, res: Response) => {
    res.sendStatus(200);
    try {
      const data = req.body as TelegramUpdate;
      if (data.message) {
        if (data.message?.chat.id === apiconfig.telegram.my_chat_id) {
          if (data.message.text) {
            await telegramapis(process.env.TELEGRAM_TOKEN).sendMessage(data.message.chat.id, confirmMessage, {
              reply_markup: {
                inline_keyboard: [[{ callback_data: encodeURIComponent(data.message.text), text: 'Yes' }]],
              },
            });
          }
        }
      } else {
        const info = data.callback_query as TelegramCallbackQuery;
        if (info.data === 'post' && info.message.text) {
          await newPostFromTG(info.message.text, info.message.chat.id);
        } else if (info.message.text?.match(confirmMessage)) {
          await newPostFromTG(info.data, info.message.chat.id);
        }
      }
    } catch (err) {
      catchErrorWithTelegram(err);
    }
  },
};

export default telegramCtrl;
