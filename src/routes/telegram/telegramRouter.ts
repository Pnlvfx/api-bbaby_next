import { Router } from 'express';
import telegramCtrl from './telegramCtrl';
import ttdownloader from '../../lib/ttdownloader/ttdownloader';

const telegramRouter = Router();

telegramRouter.post(`/bot${process.env.TELEGRAM_TOKEN}`, telegramCtrl.processUpdate);

telegramRouter.post(`/bot${process.env.TIKTOK_TELEGRAM_TOKEN}`, ttdownloader.processUpdate);

export default telegramRouter;
