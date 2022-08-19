import {Router} from 'express';
import redditCtrl from './redditCtrl';

const redditRouter = Router();

redditRouter.get('/login',  redditCtrl.redditLogin);

redditRouter.get('/logout', redditCtrl.redditLogout);

redditRouter.get('/posts', redditCtrl.redditPosts);

export default redditRouter;