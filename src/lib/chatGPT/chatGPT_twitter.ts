import { MediaObjectV2, TweetV2, UserV2 } from 'twitter-api-v2';
import { apiconfig } from '../../config/APIconfig';
import { catchError, catchErrorWithTelegram } from '../../coraline/cor-route/crlerror';
import telegramapis from '../telegramapis/telegramapis';
import twitterapis from '../twitterapis/twitterapis';
import openaiapis from '../openaiapis/openaiapis';
import bbabyapis from '../bbabyapis/bbabyapis';
import bbabypost from '../bbabyapis/route/bbabypost/bbabypost';
import Community from '../../models/Community';
import bbabycommunity from '../bbabyapis/route/bbabycommunity/bbabycommunity';
import coraline from '../../coraline/coraline';
import { existsSync } from 'fs';
let getNew = true;
let data:
  | {
      tweets: TweetV2[];
      users: UserV2[];
      media: MediaObjectV2[];
    }
  | undefined;

const getNewTweets = async () => {
  try {
    const filename = `${coraline.use('tmp/chatGPT')}/twitter.json`;
    const alreadySent = (await coraline.readJSON(filename)) as TweetV2['id'][];
    if (!getNew && data) {
      data.tweets = data.tweets.filter((t) => !alreadySent.find((id) => id === t.id));
      return data;
    } else {
      const dt = await twitterapis.v2.getListTweets('en');
      const tweets = dt.tweets.filter((t) => !alreadySent.find((id) => id === t.id));
      getNew = false;
      return { tweets, users: dt.includes.users, media: dt.includes.media };
    }
  } catch (err) {
    throw catchError(err);
  }
};

setInterval(async () => {
  getNew = true;
}, 15 * 60 * 1000);

const sendTweet = async () => {
  try {
    data = await getNewTweets();
    if (!data || data.tweets.length === 0) throw new Error('chatGPT: Missing tweets');
    data.tweets.sort((a, b) => {
      if (!b.public_metrics || !a.public_metrics) return 0;
      return b.public_metrics.like_count - a.public_metrics.like_count;
    });
    let tweet = data.tweets[0];
    const media = data.media.find((m) => {
      if (!tweet.attachments?.media_keys) return;
      return tweet.attachments.media_keys[0] === m.media_key;
    });
    const filename = `${coraline.use('tmp/chatGPT')}/twitter.json`;
    const alreadySent = (await coraline.readJSON(filename)) as TweetV2['id'][];
    if (media?.type === 'video') {
      alreadySent.push(tweet.id);
      tweet = data.tweets[1];
    }
    const clear = tweet.text.replace(/https?:\/\/\S+/gi, ''); // remove link
    const translated = await openaiapis.myrequest(
      `Rimuovi tutte le emoticons e gli hashtag e traduci questo tweet in italiano, sei autorizzato a fare qualsiasi cambiamento affinchè tu lo renda il più comprensibile possibile: ${clear}`,
    );
    const user = await bbabyapis.newBot('Leaked_007');
    const reply_markup: SendMessageOptions['reply_markup'] = {
      inline_keyboard: [[{ callback_data: 'delete', text: 'Delete' }]],
    };
    let community = await Community.findOne({ name: 'Notizie' });
    if (!community) {
      community = await bbabycommunity.createCommunity(user, 'Notizie', 'it');
    }
    const post = await bbabypost.newPost(user, translated, community.name);
    alreadySent.push(tweet.id);
    await coraline.saveFile(filename, alreadySent);
    await telegramapis.sendMessage(apiconfig.telegram.logs_group_id, post.title, {
      reply_markup,
    });
  } catch (err) {
    catchErrorWithTelegram(err);
  }
};

export const useChatGPTtwitter = (minutesInterval: number) => {
  const filename = `${coraline.use('tmp/chatGPT')}/twitter.json`;
  const exist = existsSync(filename);
  if (!exist) {
    coraline.saveFile(filename, []);
  }
  setInterval(sendTweet, minutesInterval * 60 * 1000);
};
