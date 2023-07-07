import { catchError } from '../../../coraline/cor-route/crlerror';
import coraline from '../../../coraline/coraline';
import bbcapis from '../../bbcapis/bbcapis';
import { answer } from './answer';

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
