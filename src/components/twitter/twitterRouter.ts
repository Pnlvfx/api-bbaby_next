import {Router} from 'express';
import { limiter } from '../../lib/common';
import TwitterCtrl from './twitterCtrl';

const twitterRouter = Router();

twitterRouter.post('/oauth/request_token', TwitterCtrl.twitterReqToken);

twitterRouter.post('/oauth/access_token', limiter, TwitterCtrl.twitterAccessToken);

twitterRouter.get('/user/info', TwitterCtrl.twitterUserInfo);

twitterRouter.post('/logout', TwitterCtrl.twitterLogout);

twitterRouter.get('/selected-tweets', TwitterCtrl.twitterGetUserPost);

twitterRouter.get('/home', limiter, TwitterCtrl.getHome);

export default twitterRouter;
