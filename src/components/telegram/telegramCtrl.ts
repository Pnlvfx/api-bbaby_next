import { Request, Response } from 'express';
import telegramapis from '../../lib/telegramapis/telegramapis';
import { apiconfig } from '../../config/APIconfig';
import { checkUpdateType } from '../../lib/telegramapis/hooks/telegramhooks';

export interface ConversationState {
  command: '';
  state: 0;
}

const telegramCtrl = {
  processUpdate: async (req: Request, res: Response) => {
    try {
      const data = req.body as TelegramUpdate;
      const msg = data.message as TelegramMessage;
      const check = checkUpdateType(data);
      if (check === 'message') {
        if (msg.chat.id !== apiconfig.telegram.my_chat_id) return;
        if (msg.text) {
          if (msg.text?.match('/start')) {
            await telegramapis.sendMessage(msg.chat.id, 'Hello');
          } else if (msg.text.match('/quora')) {
            await telegramapis.sendMessage(msg.chat.id, 'Please send here your text!');
          }
        } else {
          // msg is a photo or video
          if (msg.video) {
            //tiktokapis.createVideo(msg.video.file_id, msg.video.file_unique_id);
          }
        }
      } else {
        const info = data.callback_query as TelegramCallbackQuery;
        if (info.data === 'post' && info.message.text) {
          //callback_query
        }
      }
      res.sendStatus(200);
    } catch (err) {
      res.sendStatus(200);
    }
  },
};

export default telegramCtrl;
