import { Router } from 'express';
import redditCtrl from './reddire-ctrl';

const redditRouter = Router(); //used with governance Router

redditRouter.get('/login', redditCtrl.login);

redditRouter.get('/logout', redditCtrl.logout);

redditRouter.get('/posts', redditCtrl.getPosts);

export default redditRouter;
