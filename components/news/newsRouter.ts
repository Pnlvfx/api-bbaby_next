import express from 'express';
import newsCtrl from './newsCtrl';

const newsRouter = express.Router();

newsRouter.get('/news', newsCtrl.getNews);

newsRouter.get('/news/:id', newsCtrl.getOneNews)

export default newsRouter;