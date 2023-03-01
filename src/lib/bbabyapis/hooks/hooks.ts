import { catchError, catchErrorWithTelegram } from '../../../coraline/cor-route/crlerror';
import coraline from '../../../coraline/coraline';
import bbcapis from '../../bbcapis/bbcapis';
import telegramapis from '../../telegramapis/telegramapis';
import { answer } from './answer';
import { sendTweet } from './bbabytwitter';

export const useTelegram = async () => {
  try {
    const base_url = process.env.NODE_ENV === 'production' ? process.env.SERVER_URL : 'https://1c79-91-206-70-33.eu.ngrok.io';
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

export const useTwitter = () => {
  setInterval(sendTweet, 2 * 60 * 1000);
};
