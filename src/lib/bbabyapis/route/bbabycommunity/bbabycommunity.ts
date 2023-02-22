import { getUserFromToken } from '../../../../routes/user/user-functions/userFunctions';
import { catchError } from '../../../../coraline/cor-route/crlerror';
import Community from '../../../../models/Community';
import { IUser } from '../../../../models/types/user';

const bbabycommunity = {
  createCommunity: async (user: IUser, name: string) => {
    try {
      const check = await Community.exists({
        name: new RegExp(`^${name}$`, 'i'),
      });
      if (check) throw new Error(`Sorry, b/${name} is taken. Try another.`);
      const language = user.countryCode === 'IT' ? 'it' : 'en';
      const community = new Community({
        name,
        author: user.username,
        language,
        region: user.region,
      });
      user.subscribed?.push(community.name);
      await user.save();
      await community.save();
      return community;
    } catch (err) {
      throw catchError(err);
    }
  },
  getCommunity: async (token: string, name: string) => {
    try {
      const regex = new RegExp(`^${name}$`, 'i');
      const community = await Community.findOne({ name: regex });
      if (!community) throw new Error(`This community doesn't exist`);
      if (!token) {
        community.user_is_banned = false;
        community.user_is_contributor = false;
        community.user_is_moderator = false;
        community.user_is_subscriber = false;
      } else {
        const user = await getUserFromToken(token);
        if (!user) throw new Error('Your token is no more valid, please try to logout and login again.');
        const moderator = user.username === community.author ? true : user.role === 1 ? true : false;
        const isSubscriber = user.subscribed?.find((sub) => sub.toLowerCase() === name.toLowerCase()) ? true : false;
        community.user_is_banned = false;
        community.user_is_contributor = false;
        community.user_is_moderator = moderator;
        community.user_is_subscriber = isSubscriber;
      }
      return community;
    } catch (err) {
      throw catchError(err);
    }
  },
};

export default bbabycommunity;
