import { Router } from 'express';
import auth from '../../middleware/auth';
import PostCtrl from './postCtrl';

const postRouter = Router();

postRouter.get('/', PostCtrl.getPosts);

postRouter.get('/:id', PostCtrl.getPost);

postRouter.use('/', auth);

postRouter.post('/', PostCtrl.createPost);

postRouter.post('/:id/vote', PostCtrl.voting);

postRouter.delete('/:id', PostCtrl.deletePost);

export default postRouter;
