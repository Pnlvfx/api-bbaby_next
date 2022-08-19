import express from 'express';
import searchCtrl from './searchCtrl';

const searchRouter = express.Router()

searchRouter.get('/', searchCtrl.search)

searchRouter.get('/today-trend', searchCtrl.searchTrend)

export default searchRouter;