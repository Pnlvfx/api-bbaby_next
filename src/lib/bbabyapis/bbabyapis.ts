import mongoose from 'mongoose';
import config from '../../config/config';
import { catchErrorWithTelegram } from '../../config/common';
import bbcapis from '../bbcapis/bbcapis';
import coraline from '../../coraline/coraline';
import telegramapis from '../telegramapis/telegramapis';
import bbabynews from './route/bbabynews/bbabypost/bbabynews';
import { catchError } from '../../coraline/cor-route/crlerror';
import userapis from '../userapis/userapis';
import bbabypost from './route/bbabypost/bbabypost';
import { Chance } from 'chance';
import BBC from '../../models/BBC';

const base_url = config.NODE_ENV === 'production' ? config.SERVER_URL : 'https://290b-91-206-70-33.eu.ngrok.io';

const bbabyapis = {
  initialize: async () => {
    try {
      const db = process.env.NODE_ENV === 'production' ? config.MONGO_URI : 'mongodb://localhost:27017/bbabystyle'; // local;
      await mongoose.connect(db);
      // await telegramapis.setWebHook(`${base_url}/bot${config.TELEGRAM_TOKEN}`);
      // await telegramapis.setMyCommands([
      //   { command: 'start', description: 'Start the bot' },
      //   { command: 'quora', description: 'Quora' },
      // ]);
      //const timeinterval = coraline.date.hourToms(1);
      //setInterval(bbcapis.start, timeinterval);
      await BBC.deleteMany({})
      //await bbcapis.start()
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
  answer: async () => {
    try {
      // const chance = new Chance()
      // const email = chance.email()
      // const password = coraline.generateRandomId(10);
      // const username = coraline.createPermalink(chance.name() + chance.year({min: 1964, max: 2000}))
      // const user = await bbabyapis.newUser(email, username, password, true);
      // //const user = await User.findOne({is_bot: true});
      // //if (!user) throw new Error('Missing user');
      // const question = await openaiapis.request(`Ask me something about React without writing the response!`);
      // await bbabyapis.newPost(user, question, 'React')
    } catch (err) {
      throw catchError(err);
    }
  },
  newBot: async () => {
    try {
      const chance = new Chance()
      const email = chance.email()
      const password = coraline.generateRandomId(10);
      const username = coraline.createPermalink(chance.name() + chance.year({min: 1964, max: 2000}))
      const user = await userapis.newUser(email, username, password);
      user.is_bot = true
      await user.save();
      return user;
    } catch (err) {
      throw catchError(err)
    }
  },
  post: bbabypost,
  news: bbabynews,
};

export default bbabyapis;
