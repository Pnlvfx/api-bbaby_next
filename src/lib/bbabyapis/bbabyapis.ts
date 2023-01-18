import mongoose from 'mongoose';
import config from '../../config/config';
import { catchErrorWithTelegram } from '../../config/common';
import bbcapis from '../bbcapis/bbcapis';
import coraline from '../../coraline/coraline';
import telegramapis from '../telegramapis/telegramapis';
import bbabynews from './route/bbabynews';

const base_url = config.NODE_ENV === 'production' ? config.SERVER_URL : 'https://290b-91-206-70-33.eu.ngrok.io';

const bbabyapis = {
  initialize: async () => {
    try {
      const db = process.env.NODE_ENV === 'production' ? config.MONGO_URI : 'mongodb://localhost:27017/bbabystyle'; // local;
      await mongoose.connect(db);
      await telegramapis.setWebHook(`${base_url}/bot${config.TELEGRAM_TOKEN}`);
      await telegramapis.setMyCommands([
        { command: 'start', description: 'Start the bot' },
        { command: 'quora', description: 'Quora' },
      ]);
      const timeinterval = coraline.date.hourToms(1);
      const interval = setInterval(bbcapis.start, timeinterval);
      await bbcapis.start();
      //const latest = await BBC.find({ date: { $ne: undefined } }).sort({ date: -1 });
    } catch (err) {
      console.log(err);
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
  news: bbabynews,
};

export default bbabyapis;
