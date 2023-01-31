import { Router } from 'express';
import youtubeCtrl from './youtubeCtrl';
import { limiter } from '../../../config/common';

const youtubeRouter = Router();

youtubeRouter.post('/access_token', limiter, youtubeCtrl.youtubeAccessToken);

youtubeRouter.post('/', youtubeCtrl.uploadYoutube);

export default youtubeRouter;
