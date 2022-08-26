import {Router} from 'express';
import redditCtrl from './redditCtrl';

const redditRouter = Router(); //used with governance Router

redditRouter.get('/login',  redditCtrl.redditLogin);

redditRouter.get('/logout', redditCtrl.redditLogout);

redditRouter.get('/public_posts', redditCtrl.getRedditPosts);

redditRouter.get('/posts', redditCtrl.redditPostsWithToken);

export default redditRouter;