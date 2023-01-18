import { Request, Response } from 'express';
import telegramapis from '../../lib/telegramapis/telegramapis';
import { apiconfig } from '../../config/APIconfig';
import { checkUpdateType } from '../../lib/telegramapis/hooks/telegramhooks';
import coraline from '../../coraline/coraline';
import tiktokapis from '../../lib/tiktokapis/tiktokapis';

const TTFullbotID = 420309635;
const isTiktokUrl = (url: string) => {
  const regex = /https:\/\/vm\.tiktok\.com\/([a-zA-Z0-9]+)/;
  if (url.match(regex)) {
    return true;
  } else {
    return false;
  }
};

export interface ConversationState {
  command: '',
  state: 0,
};

let conversationState = {
  command: '',
  state: 0,
};

const telegramCtrl = {
  processUpdate: async (req: Request, res: Response) => {
    try {
      const data = req.body as TelegramUpdate;
      const msg = data.message as TelegramMessage;
      if (msg.chat.id !== apiconfig.telegram.my_chat_id) return;
      const check = checkUpdateType(data);
      if (conversationState.state > 0) {
      } else if (check === 'message') {
        if (msg.text) {
          if (msg.text?.match('/start')) {
            await telegramapis.sendMessage(msg.chat.id, 'Hello');
          } else if (msg.text.match('/quora')) {
            conversationState = {
              command: '/quora',
              state: 1,
            };
            await telegramapis.sendMessage(msg.chat.id, 'Please send here your text!');
          } else if (coraline.isUrl(msg.text as string)) {
            if (isTiktokUrl(msg.text as string)) {
            } else {
              
            }
          }
        } else {
          // msg is a photo or video
          if (msg.video) {
            tiktokapis.createVideo(msg.video.file_id, msg.video.file_unique_id);
          } else {
          }
        }
      } else {
        //when using a button
        const info = data.callback_query as TelegramCallbackQuery;
        if (info.data === 'translate') {
        }
      }
      res.sendStatus(200);
    } catch (err) {
      res.sendStatus(200);
    }
  },
};

export default telegramCtrl;
