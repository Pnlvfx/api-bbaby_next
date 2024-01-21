import { Router } from 'express';
import commentCtrl from './comment-ctrl';
import auth from '../../middleware/auth';

const commentRouter = Router();

commentRouter.get('/root/:rootId', commentCtrl.childComments);

commentRouter.post('/', auth, commentCtrl.createComment);

export default commentRouter;
