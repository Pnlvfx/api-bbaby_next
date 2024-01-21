import { Router } from 'express';
import searchCtrl from './search-ctrl';

const searchRouter = Router();

searchRouter.get('/', searchCtrl.search);

searchRouter.get('/today-trend', searchCtrl.searchTrend);

export default searchRouter;
