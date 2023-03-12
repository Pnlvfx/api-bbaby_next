import { catchErrorWithTelegram } from '../../../coraline/cor-route/crlerror';
import coraline from '../../../coraline/coraline';
import bbabyapis from '../../../lib/bbabyapis/bbabyapis';
import bbabycommunity from '../../../lib/bbabyapis/route/bbabycommunity/bbabycommunity';
import bbabypost from '../../../lib/bbabyapis/route/bbabypost/bbabypost';
import Community from '../../../models/Community';

export const newPostFromTG = async (message: string) => {
  try {
    const user = await bbabyapis.newBot('Leaked_007');
    let community = await Community.findOne({ name: coraline.mongo.regexUpperLowerCase('Notizie') });
    if (!community) {
      community = await bbabycommunity.createCommunity(user, 'Notizie', 'it');
    }
    await bbabypost.newPost(user, message.split(':')[1], community.name);
  } catch (err) {
    catchErrorWithTelegram(err);
  }
};
