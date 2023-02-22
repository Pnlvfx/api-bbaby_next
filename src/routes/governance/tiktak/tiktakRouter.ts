import { Router } from 'express';
import tiktakCtrl from './tiktakCtrl';

const tiktakRouter = Router();

tiktakRouter.get('/', tiktakCtrl.getTiktaks);

tiktakRouter.post('/new-tiktak', tiktakCtrl.newTiktak);

tiktakRouter.post('/create', tiktakCtrl.createTiktak);

tiktakRouter.get('/:permalink', tiktakCtrl.getTiktak);

export default tiktakRouter;
