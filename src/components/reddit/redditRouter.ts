import {Router} from 'express';
import { limiter } from '../../lib/common';
import redditCtrl from './redditCtrl';

const redditRouter = Router(); //used with governance Router

redditRouter.get('/login',  redditCtrl.redditLogin);

redditRouter.get('/logout', redditCtrl.redditLogout);

redditRouter.get('/public_posts', redditCtrl.getRedditPosts);

redditRouter.get('/posts', limiter, redditCtrl.redditPostsWithToken);

redditRouter.get('/community_posts', redditCtrl.getRedditPostsFromCommunity);

export default redditRouter;