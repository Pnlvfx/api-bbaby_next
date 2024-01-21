import { Router } from 'express';
import categoryCtrl from './category-ctrl';

const categoryRouter = Router();

categoryRouter.get('/', categoryCtrl.getCategories);

export default categoryRouter;
