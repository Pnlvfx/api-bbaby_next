import { Router } from 'express';
import tiktakCtrl from './tiktakCtrl';

const tiktakRouter = Router();

tiktakRouter.get('/', tiktakCtrl.getTiktaks);

tiktakRouter.post('/new-tiktak', tiktakCtrl.newTiktak);

tiktakRouter.get('/:permalink', tiktakCtrl.getTiktak);

tiktakRouter.post('/:permalink/background-video', tiktakCtrl.createBgVideo);

tiktakRouter.post('/:permalink/create', tiktakCtrl.createVideo);

tiktakRouter.post('/:permalink/delete', tiktakCtrl.delete);

export default tiktakRouter;
