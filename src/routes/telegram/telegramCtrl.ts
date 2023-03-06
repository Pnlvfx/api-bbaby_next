import { Request, Response } from 'express';
import { apiconfig } from '../../config/APIconfig';
import { checkUpdateType } from '../../lib/telegramapis/hooks/telegramhooks';
import bbabyapis from '../../lib/bbabyapis/bbabyapis';
import Community from '../../models/Community';

export interface ConversationState {
  command: '';
  state: 0;
}

const telegramCtrl = {
  processUpdate: async (req: Request, res: Response) => {
    try {
      const data = req.body as TelegramUpdate;
      const check = checkUpdateType(data);
      if (check === 'message') {
        if (data.message?.chat.id === apiconfig.telegram.logs_group_id) {
          const msg = data.message as TelegramMessage;
          if (msg.text) {
            if (msg.reply_to_message) {
              const user = await bbabyapis.AIuser();
              let community = await Community.findOne({ name: 'Notizie' });
              if (!community) {
                community = await bbabyapis.community.createCommunity(user, 'Notizie', 'it');
              }
              const title = msg.text.split(':')[1];
              await bbabyapis.post.newPost(user, title, community.name);
            }
          }
        }
      } else {
        const info = data.callback_query as TelegramCallbackQuery;
        if (info.data === 'post' && info.message.text) {
          //const title = info.message.text.split(':')[1];
        }
      }
      res.sendStatus(200);
    } catch (err) {
      res.sendStatus(200);
    }
  },
};

export default telegramCtrl;
