import express from 'express';
import newsCtrl from './newsCtrl';

const newsRouter = express.Router();

newsRouter.get('/', newsCtrl.getNews);

newsRouter.get('/:permalink', newsCtrl.getOneNews);

export default newsRouter;