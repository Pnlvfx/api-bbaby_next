import { MediaObjectV2, TweetV2, UserV2 } from 'twitter-api-v2';
import { apiconfig } from '../../../config/APIconfig';
import { catchError, catchErrorWithTelegram } from '../../../coraline/cor-route/crlerror';
import telegramapis from '../../telegramapis/telegramapis';
import twitterapis from '../../twitterapis/twitterapis';
import coraline from '../../../coraline/coraline';
import { existsSync } from 'fs';
import bbabyapis from '../bbabyapis';
let getNew = true;
let data: {
  tweets: TweetV2[];
  users: UserV2[];
  media: MediaObjectV2[];
};

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

setInterval(() => {
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
    const filename = `${coraline.use('tmp/chatGPT')}/twitter.json`;
    const alreadySent = (await coraline.readJSON(filename)) as TweetV2['id'][];
    let tweet = data.tweets[0];
    const regex = /^(spectatorindex|disclosetv|WarMonitors|nexta_tv|AZgeopolitics)$/;
    await Promise.all(
      data.tweets.map((t) => {
        if (t.referenced_tweets) return;
        const media = data.media.find((m) => {
          if (!t.attachments?.media_keys) return;
          return t.attachments.media_keys[0] === m.media_key;
        });
        if (media?.type === 'video') return;
        if (media?.type === 'image') return;
        const user = data.users.find((u) => u.id === t.author_id);
        if (!user) return;
        if (regex.test(user.username)) {
          tweet = t;
        }
      }),
    );
    let clear = tweet.text.replace(/https?:\/\/\S+/gi, ''); // remove link
    clear = clear.replace('BREAKING: ', '');
    console.log({ twText: clear });
    let translated: string;
    try {
      translated = await bbabyapis.AIrequest(
        `Rimuovi tutte le emoticons e gli hashtag e traduci questo tweet in italiano, sei autorizzato a fare qualsiasi cambiamento affinchè tu lo renda il più comprensibile possibile: ${clear}`,
      );
    } catch (err) {
      if (err instanceof Error && err.message.match('This content may violate our')) {
        console.log('This tweet contain offensive content');
        alreadySent.push(tweet.id);
        await coraline.saveFile(filename, alreadySent);
      }
      throw catchError(err);
    }
    const reply_markup: SendMessageOptions['reply_markup'] = {
      inline_keyboard: [[{ callback_data: 'post', text: 'Post' }]],
    };
    const user = data.users.find((u) => u.id === tweet.author_id);
    if (!user) throw new Error('Missing user for this tweet');
    await telegramapis(process.env.TELEGRAM_TOKEN).sendMessage(apiconfig.telegram.my_chat_id, `${user.username}: ${translated}`, {
      reply_markup,
    });
    alreadySent.push(tweet.id);
    await coraline.saveFile(filename, alreadySent);
  } catch (err) {
    catchErrorWithTelegram(err);
  }
};

export const useTwitterNotification = (minutesInterval: number) => {
  const filename = `${coraline.use('tmp/chatGPT')}/twitter.json`;
  const exist = existsSync(filename);
  if (!exist) coraline.saveFile(filename, []);
  setInterval(sendTweet, minutesInterval * 60 * 1000);
};
