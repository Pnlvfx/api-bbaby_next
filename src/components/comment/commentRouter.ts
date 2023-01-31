import { Router } from 'express';
import commentCtrl from './commentCtrl';

const commentRouter = Router();

commentRouter.post('/', commentCtrl.createComment);

commentRouter.get('/root/:rootId', commentCtrl.childComments);

export default commentRouter;
