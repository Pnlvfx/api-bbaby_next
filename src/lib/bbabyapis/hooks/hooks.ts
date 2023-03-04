import config from '../../../config/config';
import { ETwitterStreamEvent, TwitterApi } from 'twitter-api-v2';
import { catchError, catchErrorWithTelegram } from '../../../coraline/cor-route/crlerror';
import coraline from '../../../coraline/coraline';
import bbcapis from '../../bbcapis/bbcapis';
import telegramapis from '../../telegramapis/telegramapis';
import { answer } from './answer';

export const useTelegram = async () => {
  try {
    const base_url = config.NODE_ENV === 'production' ? config.SERVER_URL : 'https://1c79-91-206-70-33.eu.ngrok.io';
    await telegramapis.setWebHook(`${base_url}/bot${config.TELEGRAM_TOKEN}`);
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
    const client = new TwitterApi({
      appKey: config.TWITTER_CONSUMER_KEY,
      appSecret: config.TWITTER_CONSUMER_SECRET,
      accessToken: config.BBABYITA_ACCESS_TOKEN,
      accessSecret: config.BBABYITA_ACCESS_TOKEN_SECRET,
    });
    const stream = await client.v2.getStream('/statuses/mentions_timeline.json');
    console.log(stream);
    stream.on(ETwitterStreamEvent.ConnectionError, (err) => {
      console.log(err, 'Connection Error');
    });
    stream.on(ETwitterStreamEvent.ConnectionClosed, () => {
      console.log('Connection has been closed.');
    });
    stream.on(ETwitterStreamEvent.Data, (data) => {
      console.log(data);
    });
    stream.on(ETwitterStreamEvent.DataKeepAlive, () => console.log('Twitter has a keep-alive packet.'));
  } catch (err) {
    throw catchError(err);
  }
  //setInterval(sendTweet, 2 * 60 * 1000);
};
