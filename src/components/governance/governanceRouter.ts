import { Router } from 'express';
import { limiter } from '../../config/common';
import governanceCtrl from './governanceCtrl';
import youtubeRouter from './youtube/youtubeRouter';
import tiktakRouter from './tiktak/tiktakRouter';

const governanceRouter = Router();

governanceRouter.use('/youtube', youtubeRouter);

governanceRouter.use('/tiktak', tiktakRouter);

governanceRouter.post('/create-image', governanceCtrl.createImage);

governanceRouter.post('/create-video', governanceCtrl.createVideo);

governanceRouter.post('/translate', governanceCtrl.translate);

governanceRouter.post('/news/article', governanceCtrl.getBBCarticle);

governanceRouter.post('/news', governanceCtrl.postArticle);

governanceRouter.get('/pexels', governanceCtrl.getPexelsImage);

governanceRouter.get('/BBCnews', limiter, governanceCtrl.getBBCarticles);

export default governanceRouter;
