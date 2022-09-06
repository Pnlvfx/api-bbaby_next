import {Router} from 'express';
import { limiter } from '../../lib/common';
import governanceCtrl from './governanceCtrl';
import youtubeRouter from './youtube/youtubeRouter';

const governanceRouter = Router()

governanceRouter.use('/youtube', youtubeRouter);

governanceRouter.post('/create-image', governanceCtrl.createImage);

governanceRouter.post('/create-video', governanceCtrl.createVideo);

governanceRouter.post('/translate', governanceCtrl.translate);

governanceRouter.post('/news/article', governanceCtrl.getArticleDescription);

governanceRouter.post('/news', governanceCtrl.postArticle);

governanceRouter.get('/pexels', governanceCtrl.getPexelsImage);

governanceRouter.get('/BBCnews', limiter, governanceCtrl.getBBCnews);

export default governanceRouter;
