import {Router} from 'express';
import governanceCtrl from './governanceCtrl';

const governanceRouter = Router()

governanceRouter.post('/governance/create-image', governanceCtrl.createImage)

governanceRouter.post('/governance/create-video', governanceCtrl.createVideo)

//governanceRouter.post('/governance/youtube/access_token', governanceCtrl.youtubeAccessToken)

governanceRouter.post('/governance/youtube', governanceCtrl.uploadYoutube)

governanceRouter.post('/governance/translate-tweet', governanceCtrl.translateTweet)

governanceRouter.get('/governance/BBCnews', governanceCtrl.getArticles)

governanceRouter.post('/governance/news/article', governanceCtrl.getArticle)

governanceRouter.post('/governance/news', governanceCtrl.postArticle)

governanceRouter.get('/governance/pexels', governanceCtrl.getPexelsImage)

export default governanceRouter;
