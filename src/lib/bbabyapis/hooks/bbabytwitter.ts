import { TweetV1TimelineResult } from 'twitter-api-v2';
import { apiconfig } from '../../../config/APIconfig';
import config from '../../../config/config';
import { catchError, catchErrorWithTelegram } from '../../../coraline/cor-route/crlerror';
import telegramapis from '../../telegramapis/telegramapis';
import twitterapis from '../../twitterapis/twitterapis';
import bbabyapis from '../bbabyapis';
const alreadySent: TweetV1TimelineResult = [];

export const getNewTweets = async () => {
  try {
    const tweets = await twitterapis.getListTweets(config.BBABY_ACCESS_TOKEN, config.BBABY_ACCESS_TOKEN_SECRET, 'en');
    const filtered = tweets.filter((t) => !alreadySent.find((pt) => pt.id === t.id));
    return filtered;
  } catch (err) {
    throw catchError(err);
  }
};

export const sendTweet = async () => {
  try {
    console.log('new Twitter request');
    const tweets = (await getNewTweets())?.sort((a, b) => b.favorite_count - a.favorite_count);
    if (!tweets || tweets.length === 0) return;
    tweets.length = tweets.length >= 2 ? 2 : tweets.length;
    tweets?.map(async (tweet) => {
      try {
        if (!tweet.full_text) return;
        if (tweet.extended_entities?.media && tweet.extended_entities.media[0]?.type === 'video') return;
        const withoutLink = tweet.full_text.replace(/https?:\/\/\S+/gi, '');
        if (!withoutLink) return;
        const translated = await bbabyapis.translate(withoutLink, 'en', 'it');
        const toSend = `${process.env.NODE_ENV} ${tweet.user.name}: ${translated}`;
        console.log({ toSend });
        const reply_markup: SendMessageOptions['reply_markup'] = {
          inline_keyboard: [[{ callback_data: 'post', text: 'Post' }]],
        };
        if (tweet.extended_entities?.media && tweet.extended_entities.media[0]?.type === 'photo') {
          await telegramapis.sendPhoto(apiconfig.telegram.logs_group_id, tweet?.extended_entities.media[0].media_url_https, {
            caption: toSend,
          });
        } else {
          await telegramapis.sendMessage(apiconfig.telegram.logs_group_id, toSend, {
            reply_markup,
          });
        }
        alreadySent.push(tweet);
      } catch (err) {
        throw catchError(err);
      }
    });
  } catch (err) {
    catchErrorWithTelegram(err);
  }
};
