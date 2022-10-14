import { Router } from 'express';
import musicCtrl from './musicCtrl';

const musicRouter = Router();

musicRouter.post('/search', musicCtrl.search);

musicRouter.get('/all', musicCtrl.all);

musicRouter.get('/:id', musicCtrl.singleMusic);

musicRouter.post('/download', musicCtrl.downloadMusic);

export default musicRouter;