import { Router } from 'express';
import searchCtrl from './searchCtrl';

const searchRouter = Router();

searchRouter.get('/', searchCtrl.search);

searchRouter.get('/today-trend', searchCtrl.searchTrend);

export default searchRouter;
