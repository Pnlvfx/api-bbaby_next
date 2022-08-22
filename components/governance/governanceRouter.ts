import {Router} from 'express';
import governanceCtrl from './governanceCtrl';
import youtubeRouter from './youtube/youtubeRouter';

const governanceRouter = Router()

governanceRouter.use('/youtube', youtubeRouter);

governanceRouter.post('/create-image', governanceCtrl.createImage);

governanceRouter.post('/create-video', governanceCtrl.createVideo);

governanceRouter.post('/translate-tweet', governanceCtrl.translateTweet)

governanceRouter.get('/BBCnews', governanceCtrl.getArticles)

governanceRouter.post('/news/article', governanceCtrl.getArticle)

governanceRouter.post('/news', governanceCtrl.postArticle)

governanceRouter.get('/pexels', governanceCtrl.getPexelsImage)

export default governanceRouter;
