import { Request, Response } from 'express';
import { apiconfig } from '../../config/APIconfig';
import { catchErrorWithTelegram } from '../../coraline/cor-route/crlerror';
import telegramapis from '../../lib/telegramapis/telegramapis';
import coraline from '../../coraline/coraline';
import { handleError } from '../../lib/ttdownloader/ttdownloader';
import tiktokapis from '../../lib/tiktokapis/tiktokapis';
const telegram = telegramapis(process.env.TIKTOK_TELEGRAM_TOKEN);
const confirmMessage = 'Are you sure that you want to share this?';

const telegramCtrl = {
  processUpdate: async (req: Request, res: Response) => {
    res.sendStatus(200);
    try {
      const data = req.body as TelegramUpdate;
      if (data.message) {
        if (!data.message.text) return await handleError(data.message.chat.id, 'Missing text');
        if (data.message?.chat.id === apiconfig.telegram.my_chat_id) {
          if (coraline.isUrl(data.message.text)) {
            await telegram.sendMessage(data.message.chat.id, 'Please wait...');
            const info = await tiktokapis.getInfo(data.message.text);
            if (info.video.url.no_wm) {
              await telegram.sendMessage(data.message.chat.id, 'Please wait...');
              // const video = await coraline.media.getMediaFromUrl(data.message.text, `tmp/tiktok`, 'videos');
              // const text = await tiktokapis.extractText(video,);
            }
          } else {
            await telegram.sendMessage(data.message.chat.id, confirmMessage, {
              reply_markup: {
                inline_keyboard: [[{ callback_data: encodeURIComponent(data.message.text), text: 'Yes' }]],
              },
            });
          }
        }
      }
    } catch (err) {
      catchErrorWithTelegram(err);
    }
  },
};

export default telegramCtrl;
