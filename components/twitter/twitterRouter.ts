import {Router} from 'express';
import TwitterCtrl from './twitterCtrl';

const twitterRouter = Router()

twitterRouter.post('/oauth/request_token', TwitterCtrl.twitterReqToken)

twitterRouter.post('/oauth/access_token', TwitterCtrl.twitterAccessToken)

twitterRouter.get('/user/info', TwitterCtrl.twitterUserInfo)

twitterRouter.get('/selected-tweets', TwitterCtrl.twitterGetUserPost)

twitterRouter.post('/logout', TwitterCtrl.twitterLogout)

export default twitterRouter;
