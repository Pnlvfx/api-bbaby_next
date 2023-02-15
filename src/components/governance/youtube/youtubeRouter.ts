import { Router } from 'express';
import youtubeCtrl from './youtubeCtrl';

const youtubeRouter = Router();

youtubeRouter.post('/access_token', youtubeCtrl.youtubeAccessToken);

youtubeRouter.post('/', youtubeCtrl.uploadYoutube);

export default youtubeRouter;
