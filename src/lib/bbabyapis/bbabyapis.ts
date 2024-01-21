import config from '../../config/config';
import mongoose from 'mongoose';
import userapis from '../userapis/userapis';
import bbabypost from './route/bbabypost/bbabypost';
import { Chance } from 'chance';
import User from '../../models/user';
import openaiapis from '../openaiapis/openaiapis';
import { IUser } from '../../models/types/user';
import Post from '../../models/post';
import bbabycommunity from './route/bbabycommunity/bbabycommunity';
import { answer } from './hooks/answer';
import { sendLog } from '../telegram';
import coraline from 'coraline';
const bbabyapis = {
  initialize: async () => {
    try {
      // check();
      const db = config.NODE_ENV === 'production' ? config.MONGO_URI : 'mongodb://localhost:27017/bbabystyle';
      await mongoose.connect(db);
      // useTwitterNotifications(30);
      // useEarthquakeAI(5);
    } catch (err) {
      sendLog('bbabyapis.initialize' + ' ' + err);
    }
  },
  getLinkPreview: async (url: string) => {
    const res = await fetch(`https://bbabystyle.uc.r.appspot.com/v2?url=${url}`);
    const data = await res.json();
    if (!res.ok) throw new Error(`failed to get metadata info from this url: ${url}`);
    return data.metadata as MetadataOutput;
  },
  newBot: async (username?: string) => {
    if (username) {
      const regex = coraline.regex.upperLowerCase(username);
      const exist = await User.findOne({ username: regex });
      if (exist) return exist;
      const email = new Chance().email();
      const password = coraline.generateRandomId(10);
      const _username = coraline.createPermalink(username);
      const user = await userapis.newUser('https://www.bbabystyle.com', email, _username, password);
      user.is_bot = true;
      await user.save();
      return user;
    } else {
      const chance = new Chance();
      const email = chance.email();
      const password = coraline.generateRandomId(10);
      const _username = coraline.createPermalink(chance.name() + coraline.year({ min: 1964, max: 2000 }));
      const ipInfo = await userapis.getIP();
      const user = await userapis.newUser('https://www.bbabystyle.com', email, _username, password, ipInfo);
      user.is_bot = true;
      await user.save();
      return user;
    }
  },
  AIuser: async () => {
    let user: IUser;
    const randomNumber = Math.random();
    if (randomNumber < 0.9) {
      const users = await User.find({ is_bot: true });
      user = users.length === 0 ? await bbabyapis.newBot() : users[coraline.getRandomInt(users.length - 1)];
    } else {
      user = await bbabyapis.newBot();
    }
    return user;
  },
  AIpost: async (user: IUser, prompt: string, community: string, share = false) => {
    const title = await openaiapis.request(prompt, {
      temperature: Math.random(),
    });
    const exist = await Post.findOne({ title, community });
    if (exist) {
      if (!prompt.match(`and don't use this question or similar:`)) {
        prompt += ` and don't use this question or similar:`;
      }
      prompt = `${prompt} \n ${title},`;
      await answer(prompt);
      return;
    }
    return bbabypost.newPost(user, title, community, {
      sharePostToTG: share,
      sharePostToTwitter: share,
    });
  },
  AIrequest: async (request: string) => {
    let res: string;
    if (process.env.NODE_ENV === 'development') {
      try {
        res = await openaiapis.myrequest(request);
      } catch {
        res = await openaiapis.request(request);
      }
    } else {
      res = await openaiapis.request(request);
    }
    return res;
  },
  community: bbabycommunity,
};

export default bbabyapis;
