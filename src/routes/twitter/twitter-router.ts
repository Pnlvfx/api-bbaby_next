import { Router } from 'express';
import TwitterCtrl from './twitter-ctrl';
import twitterAuth from '../../middleware/twitter';

const twitterRouter = Router();

twitterRouter.get('/oauth2/authorize', TwitterCtrl.generateOAuthUrl);

twitterRouter.get('/oauth2/access_token', TwitterCtrl.accessToken);

twitterRouter.post('/logout', TwitterCtrl.twitterLogout);

twitterRouter.use(twitterAuth);

twitterRouter.get('/selected-tweets', TwitterCtrl.getList);

twitterRouter.get('/home', TwitterCtrl.getHome);

twitterRouter.get('/user/:id', TwitterCtrl.getUserTweets);

export default twitterRouter;
