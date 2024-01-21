import { Router } from 'express';
import generalCtrl from './general-ctrl';

const generalRouter = Router();

generalRouter.get('/images/generations', generalCtrl.generateImage);

export default generalRouter;
