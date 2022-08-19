import {Router} from 'express';
import auth from '../../middleware/auth';
import TwitterCtrl from './twitterCtrl';

const twitterRouter = Router()

twitterRouter.use(auth);

twitterRouter.post('/twitter/oauth/request_token', TwitterCtrl.twitterReqToken)

twitterRouter.post('/twitter/oauth/access_token', TwitterCtrl.twitterAccessToken)

twitterRouter.get('/twitter/user/info', TwitterCtrl.twitterUserInfo)

twitterRouter.get('/twitter/selected-tweets', TwitterCtrl.twitterGetUserPost)

twitterRouter.post('/twitter/logout', TwitterCtrl.twitterLogout)

export default twitterRouter;
