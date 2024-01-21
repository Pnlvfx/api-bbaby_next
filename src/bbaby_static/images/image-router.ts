import { Router } from 'express';
import imageCtrl from './image-ctrl';

const imageRouter = Router();

imageRouter.get('/news/:id', imageCtrl.route);

export default imageRouter;
