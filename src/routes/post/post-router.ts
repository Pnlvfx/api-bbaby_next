import { Router } from 'express';
import auth from '../../middleware/auth';
import postCtrl from './post-ctrl';

const postRouter = Router();

postRouter.get('/', postCtrl.getPosts);

postRouter.get('/hot', postCtrl.getHotPosts);

postRouter.get('/new', postCtrl.getNewPosts);

postRouter.get('/top', postCtrl.getTopPosts);

postRouter.get('/:id', postCtrl.getPost);

postRouter.post('/', auth, postCtrl.createPost);

postRouter.post('/:id/vote', auth, postCtrl.voting);

postRouter.delete('/:id', auth, postCtrl.deletePost);

export default postRouter;
