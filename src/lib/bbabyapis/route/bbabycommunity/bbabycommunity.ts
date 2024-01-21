import coraline from 'coraline';
import Community from '../../../../models/Community';
import { IUser } from '../../../../models/types/user';
import userapis from '../../../userapis/userapis';

const bbabycommunity = {
  createCommunity: async (user: IUser, name: string, language?: 'it' | 'en') => {
    const check = await Community.exists({
      name: coraline.regex.upperLowerCase(name),
    });
    if (check) throw new Error(`Sorry, b/${name} is taken. Try another.`);
    const lang = language || user.countryCode === 'IT' ? 'it' : 'en';
    const community = new Community({
      name,
      author: user.username,
      language: lang,
      region: user.region,
    });
    user.subscribed?.push(community.name);
    await user.save();
    await community.save();
    return community;
  },
  getCommunity: async (token: string, name: string) => {
    const community = await Community.findOne({ name: coraline.regex.upperLowerCase(name) });
    if (!community) throw new Error(`This community doesn't exist: ${name}`);
    if (token) {
      const user = await userapis.getUserFromToken(token);
      if (!user) throw new Error('Your token is no more valid, please try to logout and login again.');
      const moderator = user.username === community.author || user.role === 1 ? true : false;
      const isSubscriber = user.subscribed?.find((sub) => sub.toLowerCase() === name.toLowerCase()) ? true : false;
      community.user_is_banned = false;
      community.user_is_contributor = false;
      community.user_is_moderator = moderator;
      community.user_is_subscriber = isSubscriber;
    } else {
      community.user_is_banned = false;
      community.user_is_contributor = false;
      community.user_is_moderator = false;
      community.user_is_subscriber = false;
    }
    return community;
  },
};

export default bbabycommunity;
