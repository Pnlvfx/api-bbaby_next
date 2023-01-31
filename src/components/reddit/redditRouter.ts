import { Router } from 'express';
import { limiter } from '../../config/common';
import redditCtrl from './redditCtrl';

const redditRouter = Router(); //used with governance Router

redditRouter.get('/login', redditCtrl.login);

redditRouter.get('/logout', redditCtrl.logout);

redditRouter.get('/posts', limiter, redditCtrl.getPosts);

export default redditRouter;
