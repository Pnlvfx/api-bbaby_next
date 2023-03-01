import { Router } from 'express';
import governanceCtrl from './governanceCtrl';
import youtubeRouter from './youtube/youtubeRouter';
import tiktakRouter from './tiktak/tiktakRouter';
import governance from '../../middleware/governance';

const governanceRouter = Router();

governanceRouter.use(governance);

governanceRouter.use('/youtube', youtubeRouter);

governanceRouter.use('/tiktak', tiktakRouter);

governanceRouter.post('/create-image', governanceCtrl.createImage);

governanceRouter.post('/create-video', governanceCtrl.createVideo);

governanceRouter.post('/translate', governanceCtrl.translate);

governanceRouter.post('/news', governanceCtrl.postArticle);

governanceRouter.get('/news/:permalink', governanceCtrl.getBBCarticle);

governanceRouter.get('/pexels', governanceCtrl.getPexelsImage);

governanceRouter.get('/BBCnews', governanceCtrl.getBBCarticles);

export default governanceRouter;
