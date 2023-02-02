import mongoose from 'mongoose';
import config from '../../config/config';
import { catchErrorWithTelegram } from '../../config/common';
import coraline from '../../coraline/coraline';
import bbabynews from './route/bbabynews/bbabypost/bbabynews';
import { catchError } from '../../coraline/cor-route/crlerror';
import userapis from '../userapis/userapis';
import bbabypost from './route/bbabypost/bbabypost';
import { Chance } from 'chance';
import bbcapis from '../bbcapis/bbcapis';
import User from '../../models/User';
import openaiapis from '../openaiapis/openaiapis';
import { IUser } from '../../models/types/user';
import Post from '../../models/Post';
import bbabycomment from './route/bbabycomment/bbabycomment';

const bbabyapis = {
  initialize: async () => {
    try {
      const db = process.env.NODE_ENV === 'production' ? config.MONGO_URI : 'mongodb://localhost:27017/bbabystyle'; // local;
      mongoose.set('strictQuery', true);
      await mongoose.connect(db);
      //const base_url = config.NODE_ENV === 'production' ? config.SERVER_URL : 'https://16eb-91-206-70-33.eu.ngrok.io';
      // await telegramapis.setWebHook(`${base_url}/bot${config.TELEGRAM_TOKEN}`);
      // await telegramapis.setMyCommands([
      //   { command: 'start', description: 'Start the bot' },
      //   { command: 'quora', description: 'Quora' },
      // ]);
      const timeinterval = coraline.date.hourToms(1);
      setInterval(bbcapis.start, timeinterval);
      await bbcapis.start();
      setInterval(async () => {
        try {
          await bbabyapis.answer();
        } catch (err) {
          catchErrorWithTelegram(err);
        }
      }, 60 * 60 * 1000);
    } catch (err) {
      catchErrorWithTelegram(err);
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
  answer: async (prompt = 'Ask me something about React without writing the response!') => {
    try {
      const post = await bbabyapis.AIpost(prompt, 'React');
      if (!post) return;
      setTimeout(async () => {
        try {
          const user = await bbabyapis.newBot();
          const body = await openaiapis.request(post.title);
          await bbabyapis.comment.createComment(user, body, post._id, post._id);
        } catch (err) {
          catchErrorWithTelegram(err);
        }
      }, 50 * 60 * 1000);
    } catch (err) {
      throw catchError(err);
    }
  },
  newBot: async () => {
    try {
      const chance = new Chance();
      const email = chance.email();
      const password = coraline.generateRandomId(10);
      const username = coraline.createPermalink(chance.name() + chance.year({ min: 1964, max: 2000 }));
      const ipInfo = await userapis.getIP();
      const user = await userapis.newUser(email, username, password, ipInfo);
      user.is_bot = true;
      await user.save();
      return user;
    } catch (err) {
      throw catchError(err);
    }
  },
  AIpost: async (prompt: string, community: string, share = false) => {
    try {
      console.log({ prompt });
      const temperature = Math.random();
      const title = await openaiapis.request(prompt, temperature);
      console.log(title);
      const exist = await Post.findOne({ title, community });
      if (exist) {
        if (!prompt.match(`and don't use this question:`)) {
          prompt += ` and don't use this question:`;
        }
        prompt = `${prompt} \n ${title},`;
        await bbabyapis.answer(prompt);
        return;
      }
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
};

export default bbabyapis;
