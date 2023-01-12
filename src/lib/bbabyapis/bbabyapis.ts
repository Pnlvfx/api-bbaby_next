import mongoose from 'mongoose';
import config from '../../config/config';
import { catchErrorWithTelegram } from '../../config/common';
import bbcapis from '../bbcapis/bbcapis';

const bbabyapis = {
  initialize: async () => {
    try {
      const db = process.env.NODE_ENV === 'production' ? config.MONGO_URI : 'mongodb://localhost:27017'; // local;
      await mongoose.connect(config.MONGO_URI);
      // const BBCnews = await bbcapis.getNews()
      // BBCnews.map((bbc) => {

      // })
    } catch (err) {
      console.log(err)
      catchErrorWithTelegram(err);
    }
  },
};

export default bbabyapis;
