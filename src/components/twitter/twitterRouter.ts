import { Router } from 'express';
import TwitterCtrl from './twitterCtrl';
import twitterAuth from '../../middleware/twitter';

const twitterRouter = Router();

twitterRouter.post('/oauth/request_token', TwitterCtrl.twitterReqToken);

twitterRouter.post('/oauth/access_token', TwitterCtrl.twitterAccessToken);

twitterRouter.post('/logout', TwitterCtrl.twitterLogout);

twitterRouter.use(twitterAuth);

twitterRouter.get('/user/info', TwitterCtrl.twitterUserInfo);

twitterRouter.get('/selected-tweets', TwitterCtrl.getList);

twitterRouter.get('/home', TwitterCtrl.getHome);

twitterRouter.get('/user/:screen_name', TwitterCtrl.getUserTweets);

export default twitterRouter;
