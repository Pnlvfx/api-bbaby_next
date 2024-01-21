import { Router } from 'express';
import videoCtrl from './video-ctrl';

const videoRouter = Router();

videoRouter.get('/', videoCtrl.sendVideo);

export default videoRouter;
