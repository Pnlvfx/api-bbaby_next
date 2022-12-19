import { Router } from 'express';
import categoryCtrl from './categoryCtrl';

const categoryRouter = Router();

categoryRouter.get("/", categoryCtrl.getCategories)

export default categoryRouter;
