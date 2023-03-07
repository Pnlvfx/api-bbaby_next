import mongoose from 'mongoose';
import config from '../../config/config';
import coraline from '../../coraline/coraline';
import bbabynews from './route/bbabynews/bbabypost/bbabynews';
import { catchError, catchErrorWithTelegram } from '../../coraline/cor-route/crlerror';
import userapis from '../userapis/userapis';
import bbabypost from './route/bbabypost/bbabypost';
import { Chance } from 'chance';
import User from '../../models/User';
import openaiapis from '../openaiapis/openaiapis';
import { IUser } from '../../models/types/user';
import Post from '../../models/Post';
import bbabycomment from './route/bbabycomment/bbabycomment';
import bbabycommunity from './route/bbabycommunity/bbabycommunity';
import { answer } from './hooks/answer';
import { useEarthquakeAI } from '../earthquakeapis/earthquakeAI';
import { useTwitter } from './hooks/twhook';
import { check } from './hooks/hooks';
const bbabyapis = {
  initialize: async () => {
    try {
      const db = config.NODE_ENV === 'production' ? config.MONGO_URI : 'mongodb://localhost:27017/bbabystyle';
      await mongoose.connect(db);
      mongoose.set('strictQuery', true);
      check();
      if (config.NODE_ENV === 'development') {
        setInterval(coraline.memoryUsage, 60000);
        // useTwitterNotification(2);
        // await quoraapis.useQuora(5, 40);
      } else {
        useEarthquakeAI(5);
        useTwitter(5);
      }
      // const tiktak = await Tiktak.findOne({ video: { $ne: undefined } });
      // if (!tiktak || !tiktak.audio) return;
      // await speechtotext.longRunningRecognize(
      //   '/Users/simo97/Desktop/coraline/bbaby_next/static/tiktak/640487be2110cfc68a3c79ab/output1.flac',
      //   'it-IT',
      // );
      // await useTelegram();
      // await useBBC();
      // await useAnswer();
    } catch (err) {
      catchErrorWithTelegram('bbabyapis.initialize' + ' ' + err);
    }
  },
  getLinkPreview: async (url: string) => {
    try {
      const apiUrl = 'https://bbabystyle.uc.r.appspot.com';
      const res = await fetch(`${apiUrl}/v2?url=${url}`);
      const data = await res.json();
      if (!res.ok) throw new Error(`failed to get metadata info from this url: ${url}`);
      return data.metadata as MetadataOutput;
    } catch (error) {
      throw new Error(`failed to get metadata info from this url: ${url}`);
    }
  },
  newBot: async (username?: string) => {
    try {
      if (username) {
        const exist = await User.findOne({ username });
        if (exist) {
          return exist;
        } else {
          const chance = new Chance();
          const email = chance.email();
          const password = coraline.generateRandomId(10);
          const _username = coraline.createPermalink(username);
          const ipInfo = await userapis.getIP();
          const user = await userapis.newUser(email, _username, password, ipInfo);
          user.is_bot = true;
          await user.save();
          return user;
        }
      } else {
        const chance = new Chance();
        const email = chance.email();
        const password = coraline.generateRandomId(10);
        const _username = coraline.createPermalink(chance.name() + coraline.year({ min: 1964, max: 2000 }));
        const ipInfo = await userapis.getIP();
        const user = await userapis.newUser(email, _username, password, ipInfo);
        user.is_bot = true;
        await user.save();
        return user;
      }
    } catch (err) {
      throw catchError(err);
    }
  },
  AIuser: async () => {
    try {
      let user: IUser;
      const randomNumber = Math.random();
      if (randomNumber < 0.9) {
        const users = await User.find({ is_bot: true });
        if (users.length < 1) {
          user = await bbabyapis.newBot();
        } else {
          user = users[coraline.getRandomInt(users.length - 1)];
        }
      } else {
        user = await bbabyapis.newBot();
      }
      return user;
    } catch (err) {
      throw catchError(err);
    }
  },
  AIpost: async (user: IUser, prompt: string, community: string, share = false) => {
    try {
      console.log({ prompt });
      const temperature = Math.random();
      const title = await openaiapis.request(prompt, temperature);
      console.log({ title });
      const exist = await Post.findOne({ title, community });
      if (exist) {
        if (!prompt.match(`and don't use this question or similar:`)) {
          prompt += ` and don't use this question or similar:`;
        }
        prompt = `${prompt} \n ${title},`;
        await answer(prompt);
        return;
      }
      const post = await bbabyapis.post.newPost(user, title, community, {
        sharePostToTG: share,
        sharePostToTwitter: share,
      });
      return post;
    } catch (err) {
      throw catchError(err);
    }
  },
  post: bbabypost,
  news: bbabynews,
  comment: bbabycomment,
  community: bbabycommunity,
};

export default bbabyapis;
