import { Router } from 'express';
import telegramCtrl from './telegramCtrl';

const telegramRouter = Router();

telegramRouter.post(`/bot${process.env.TELEGRAM_TOKEN}`, telegramCtrl.processUpdate);

export default telegramRouter;
