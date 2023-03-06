import { TweetV2 } from 'twitter-api-v2';
import { apiconfig } from '../../../config/APIconfig';
import { catchError, catchErrorWithTelegram } from '../../../coraline/cor-route/crlerror';
import telegramapis from '../../telegramapis/telegramapis';
import twitterapis from '../../twitterapis/twitterapis';
import googleapis from '../../googleapis/googleapis';
const alreadySent: TweetV2[] = [];

const getNewTweets = async () => {
  try {
    const data = await twitterapis.getListTweets('en');
    const filtered = data.tweets.filter((t) => !alreadySent.find((pt) => pt.id === t.id));
    return { tweets: filtered, users: data.includes.users, media: data.includes.media };
  } catch (err) {
    throw catchError(err);
  }
};

const sendTweet = async () => {
  try {
    console.log('new Twitter request');
    const data = await getNewTweets();
    data.tweets.sort((a, b) => {
      if (!b.public_metrics || !a.public_metrics) return 0;
      return b.public_metrics.like_count - a.public_metrics.like_count;
    });
    if (data.tweets.length === 0) return;
    data.tweets.length = data.tweets.length >= 2 ? 2 : data.tweets.length;
    data.tweets.map(async (tweet) => {
      try {
        const media = data.media.find((m) => {
          if (!tweet.attachments?.media_keys) return;
          return tweet.attachments.media_keys[0] === m.media_key;
        });
        if (media?.type === 'video') return;
        const user = data.users.find((u) => tweet.author_id === u.id);
        if (!user) return;
        const withoutLink = tweet.text.replace(/https?:\/\/\S+/gi, '');
        const translated = await googleapis.translate(withoutLink, 'en', 'it');
        const toSend = `${process.env.NODE_ENV} ${user.name}: ${translated}`;
        console.log({ toSend });
        const reply_markup: SendMessageOptions['reply_markup'] = {
          inline_keyboard: [[{ callback_data: 'post', text: 'Post' }]],
        };
        if (media?.type === 'photo' && media.url) {
          await telegramapis.sendPhoto(apiconfig.telegram.logs_group_id, media.url, {
            caption: toSend,
          });
        } else {
          await telegramapis.sendMessage(apiconfig.telegram.logs_group_id, toSend, {
            reply_markup,
          });
        }
        alreadySent.push(tweet);
      } catch (err) {
        return;
      }
    });
  } catch (err) {
    catchErrorWithTelegram(err);
  }
};

export const useTwitterNotification = (minutesInterval: number) => {
  setInterval(sendTweet, minutesInterval * 60 * 1000);
};
