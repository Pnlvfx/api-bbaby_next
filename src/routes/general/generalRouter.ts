import { Router } from 'express';
import generalCtrl from './generalCtrl';

const generalRouter = Router();

generalRouter.get('/images/generations', generalCtrl.generateImage);

export default generalRouter;
