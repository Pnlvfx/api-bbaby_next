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
    const client = new TwitterApi(config.TWITTER_BEARER_TOKEN);
    const stream = await client.v2.sampleStream();
    console.log('stream started');
    stream.on(ETwitterStreamEvent.Connected, () => {
      console.log('connected');
    });
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

export const check = async () => {
  const keyPath = coraline.use('private_key');
  await coraline.readJSON(`${keyPath}/anonynewsitaly.json`);
  await coraline.readJSON(`${keyPath}/bbabystyle.json`);
  await coraline.readJSON(`${keyPath}/bbabystyleitalia.json`);
  await coraline.readJSON(`${keyPath}/bbabystyle_googleCredentials.json`);
  await coraline.readJSON(`${keyPath}/bbabystyle-private.json`);
  await coraline.readJSON(`${keyPath}/bbabyita.json`);
};
