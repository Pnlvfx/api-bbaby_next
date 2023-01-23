import express from 'express';
import newsCtrl from './newsCtrl';
import auth from '../../middleware/auth';

const newsRouter = express.Router();

newsRouter.get('/', newsCtrl.getArticles);

newsRouter.get('/:permalink', newsCtrl.getArticle);

newsRouter.post('/:permalink/edit', auth, newsCtrl.editNews);

export default newsRouter;