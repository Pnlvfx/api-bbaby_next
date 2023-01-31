import { Router } from 'express';
import { limiter } from '../../config/common';
import searchCtrl from './searchCtrl';

const searchRouter = Router();

searchRouter.get('/', searchCtrl.search);

searchRouter.get('/today-trend', limiter, searchCtrl.searchTrend);

export default searchRouter;
