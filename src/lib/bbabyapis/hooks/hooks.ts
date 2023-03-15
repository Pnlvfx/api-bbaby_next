import config from '../../../config/config';
import { catchError, catchErrorWithTelegram } from '../../../coraline/cor-route/crlerror';
import coraline from '../../../coraline/coraline';
import bbcapis from '../../bbcapis/bbcapis';
import ttdownloader from '../../ttdownloader/ttdownloader';
import { answer } from './answer';

export const useTelegram = async () => {
  try {
    let base_url;
    if (config.NODE_ENV === 'production') {
      base_url = config.SERVER_URL;
    } else {
      // base_url = await ngrok.connect({
      //   addr: 4000,
      // });
      base_url = 'https://29f7-212-171-109-214.eu.ngrok.io';
    }
    // const telegram = telegramapis(process.env.TELEGRAM_TOKEN);
    // await telegram.setWebHook(`${base_url}/bot${config.TELEGRAM_TOKEN}`);
    // await telegram.setMyCommands([{ command: 'start', description: 'Start the bot' }]);
    await ttdownloader.use(base_url);
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

export const check = async () => {
  const keyPath = coraline.use('private_key');
  await coraline.readJSON(`${keyPath}/bbabystyle_googleCredentials.json`);
  await coraline.readJSON(`${keyPath}/bbabystyle-private.json`);
  await coraline.readJSON(`${keyPath}/twitter.json`);
};
