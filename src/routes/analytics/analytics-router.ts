import { Router } from 'express';
import analyticsCtrl from './analytics-ctrl';

const analyticsRouter = Router();

analyticsRouter.get('/logs', analyticsCtrl.sendLog);

analyticsRouter.get('/pageview', analyticsCtrl.pageview);

export default analyticsRouter;
