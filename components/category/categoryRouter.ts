import express from 'express';
import categoryCtrl from './categoryCtrl';

const categoryRouter = express.Router();

categoryRouter.get("/", categoryCtrl.getCategories)

export default categoryRouter;
