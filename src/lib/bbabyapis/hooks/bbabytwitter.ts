import config from '../../../config/config';
import { catchError } from '../../../coraline/cor-route/crlerror';
import coraline from '../../../coraline/coraline';
import twitterapis from '../../twitterapis/twitterapis';
const path = coraline.use('lib/twitter');
const filename = `${path}/prevTweets.json`;
let firstRun = true;

export const getNewTweets = async () => {
  try {
    let prevTweets: TweetProps[];
    if (firstRun) {
      firstRun = false;
      const tweets = await twitterapis.getListTweets(config.BBABY_ACCESS_TOKEN, config.BBABY_ACCESS_TOKEN_SECRET, 'en');
      await coraline.saveFile(filename, tweets);
    } else {
      prevTweets = await coraline.readJSON(filename);
      const tweets = await twitterapis.getListTweets(config.BBABY_ACCESS_TOKEN, config.BBABY_ACCESS_TOKEN_SECRET, 'en');
      await coraline.saveFile(filename, tweets);
      const filtered = tweets.filter((t) => !prevTweets.find((pt) => pt.id === t.id));
      return filtered;
    }
  } catch (err) {
    throw catchError(err);
  }
};
