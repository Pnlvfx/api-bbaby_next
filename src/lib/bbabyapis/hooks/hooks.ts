import config from '../../../config/config';
import { catchError } from '../../../coraline/cor-route/crlerror';
import coraline from '../../../coraline/coraline';
import bbcapis from '../../bbcapis/bbcapis';
import telegramapis from '../../telegramapis/telegramapis';
import ttdownloader from '../../ttdownloader/ttdownloader';
import { answer } from './answer';

export const useTelegram = async () => {
  try {
    let base_url;
    if (config.NODE_ENV === 'production') {
      base_url = config.SERVER_URL;
    } else {
      base_url = process.env.NGROK_URL;
    }
    const telegram = telegramapis(process.env.TELEGRAM_TOKEN);
    await telegram.setWebHook(`${base_url}/bot${config.TELEGRAM_TOKEN}`);
    await telegram.setMyCommands([{ command: 'start', description: 'Start the bot' }]);
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

export const useAnswer = async (minutesInterval: number) => {
  try {
    setInterval(answer, minutesInterval * 60 * 1000);
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
