import { Router } from "express";
import youtubeCtrl from "./youtubeCtrl";

const youtubeRouter = Router();

youtubeRouter.get('/auth', youtubeCtrl.bbaby_youtubePageAuth);

youtubeRouter.post('/access_token', youtubeCtrl.youtubeAccessToken)

youtubeRouter.post('/', youtubeCtrl.uploadYoutube)

export default youtubeRouter;