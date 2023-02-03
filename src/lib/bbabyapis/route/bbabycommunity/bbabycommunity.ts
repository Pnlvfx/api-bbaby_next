import { catchError } from '../../../../coraline/cor-route/crlerror';
import Community from '../../../../models/Community';
import { IUser } from '../../../../models/types/user';

const bbabycommunity = {
  createCommunity: async (user: IUser, name: string) => {
    try {
      const check = await Community.exists({ name: new RegExp(`^${name}$`, 'i') });
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
};

export default bbabycommunity;
