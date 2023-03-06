import { Router } from 'express';
import quoraCtrl from './quoraCtrl';

const quoraRouter = Router();

quoraRouter.get('/', quoraCtrl.getQuoras);

export default quoraRouter;
