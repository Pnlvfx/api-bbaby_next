import { Router } from 'express';
import { limiter } from '../../lib/common';
import searchCtrl from './searchCtrl';

const searchRouter = Router()

searchRouter.get('/', searchCtrl.search);

searchRouter.get('/today-trend', limiter, searchCtrl.searchTrend);

searchRouter.post('/music', searchCtrl.music);

export default searchRouter;