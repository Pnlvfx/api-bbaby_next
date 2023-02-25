import { apiconfig } from '../../../config/APIconfig';
import { catchError, catchErrorWithTelegram } from '../../../coraline/cor-route/crlerror';
import coraline from '../../../coraline/coraline';
import bbcapis from '../../bbcapis/bbcapis';
import telegramapis from '../../telegramapis/telegramapis';
import bbabyapis from '../bbabyapis';
import { answer } from './answer';
import { getNewTweets } from './bbabytwitter';

export const useTelegram = async () => {
  try {
    const base_url = process.env.NODE_ENV === 'production' ? process.env.SERVER_URL : 'https://a26c-87-1-170-88.eu.ngrok.io';
    await telegramapis.setWebHook(`${base_url}/bot${process.env.TELEGRAM_TOKEN}`);
    await telegramapis.setMyCommands([{ command: 'start', description: 'Start the bot' }]);
  } catch (err) {
    throw catchError(err);
  }
};

export const useBBC = async () => {
  try {
    setInterval(bbcapis.start, coraline.date.hourToms(1));
    await bbcapis.start();
  } catch (err) {
    throw catchError(err);
  }
};

export const useAnswer = async () => {
  try {
    setInterval(async () => {
      try {
        await answer();
      } catch (err) {
        catchErrorWithTelegram(err);
      }
    }, 60 * 60 * 1000);
  } catch (err) {
    throw catchError(err);
  }
};

export const useTwitter = async () => {
  try {
    await getNewTweets(); //first load only;
    setInterval(async () => {
      try {
        console.log('new Twitter request');
        const tweets = (await getNewTweets())?.sort((a, b) => b.favorite_count - a.favorite_count);
        if (!tweets || tweets.length === 0) return;
        tweets.length = tweets.length >= 2 ? 2 : tweets.length;
        tweets?.map(async (tweet) => {
          try {
            const withoutLink = tweet.full_text.replace(/https?:\/\/\S+/gi, '');
            const translated = await bbabyapis.translate(withoutLink, 'en', 'it');
            const toSend = `${process.env.NODE_ENV} ${tweet.user.name}: ${translated}`;
            console.log({ toSend });
            const reply_markup: SendMessageOptions['reply_markup'] = {
              inline_keyboard: [[{ callback_data: 'post', text: 'Post' }]],
            };
            if (tweet?.extended_entities?.media[0]?.type === 'photo') {
              console.log('is an image');
              await telegramapis.sendPhoto(apiconfig.telegram.logs_group_id, tweet?.extended_entities.media[0].media_url_https, {
                caption: toSend,
              });
            } else {
              console.log('is not an image');
              await telegramapis.sendMessage(apiconfig.telegram.logs_group_id, toSend, {
                reply_markup,
              });
            }
          } catch (err) {
            throw catchError(err);
          }
        });
      } catch (err) {
        console.log(err);
        catchErrorWithTelegram(err);
      }
    }, 2 * 60 * 1000);
  } catch (err) {
    throw catchError(err);
  }
};
