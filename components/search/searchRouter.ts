import express from 'express';
import searchCtrl from './searchCtrl';

const searchRouter = express.Router()

searchRouter.get('/search', searchCtrl.search)

searchRouter.get('/search/today-trend', searchCtrl.searchTrend)

export default searchRouter;