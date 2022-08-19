import {Router} from 'express';
import governanceCtrl from './governanceCtrl';

const governanceRouter = Router()

governanceRouter.post('/create-image', governanceCtrl.createImage)

governanceRouter.post('/create-video', governanceCtrl.createVideo)

governanceRouter.get('/youtube/login', governanceCtrl.youtubeLogin);

//governanceRouter.post('/governance/youtube/access_token', governanceCtrl.youtubeAccessToken)

governanceRouter.post('/youtube', governanceCtrl.uploadYoutube)

governanceRouter.post('/translate-tweet', governanceCtrl.translateTweet)

governanceRouter.get('/BBCnews', governanceCtrl.getArticles)

governanceRouter.post('/news/article', governanceCtrl.getArticle)

governanceRouter.post('/news', governanceCtrl.postArticle)

governanceRouter.get('/pexels', governanceCtrl.getPexelsImage)

export default governanceRouter;
