import { catchError } from '../../../coraline/cor-route/crlerror';
import coraline from '../../../coraline/coraline';
import bbabyapis from '../../../lib/bbabyapis/bbabyapis';
import bbabycommunity from '../../../lib/bbabyapis/route/bbabycommunity/bbabycommunity';
import bbabypost from '../../../lib/bbabyapis/route/bbabypost/bbabypost';
import telegramapis from '../../../lib/telegramapis/telegramapis';
import Community from '../../../models/Community';

export const newPostFromTG = async (message: string, chat_id: number) => {
  try {
    const user = await bbabyapis.newBot('Leaked_007');
    let community = await Community.findOne({ name: coraline.regex.upperLowerCase('Notizie') });
    if (!community) {
      community = await bbabycommunity.createCommunity(user, 'Notizie', 'it');
    }
    const titles = message.split(':');
    titles.shift();
    const post = await bbabypost.newPost(user, titles.join(':'), community.name);
    await telegramapis(process.env.TELEGRAM_TOKEN).sendMessage(chat_id, `Post created! Check it out at ${process.env.CLIENT_URL}${post.permalink}.`);
  } catch (err) {
    throw catchError(err);
  }
};
