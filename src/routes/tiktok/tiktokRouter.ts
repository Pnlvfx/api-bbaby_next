import { Router } from 'express';
import tiktokCtrl from './tiktokCtrl';

const tiktokRouter = Router();

tiktokRouter.get('/download', tiktokCtrl.downloadVideo);

tiktokRouter.get('/:id', tiktokCtrl.getTiktok);

tiktokRouter.post('/:id', tiktokCtrl.save);

tiktokRouter.post('/:id/create', tiktokCtrl.createVideo);

export default tiktokRouter;
