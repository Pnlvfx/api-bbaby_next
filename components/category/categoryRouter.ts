import express from 'express';
import categoryCtrl from './categoryCtrl';

const categoryRouter = express.Router();

categoryRouter.get("/categories", categoryCtrl.getCategories)

export default categoryRouter;
