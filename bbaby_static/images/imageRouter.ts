import { Router } from "express";
import imageCtrl from "./imageCtrl";

const imageRouter = Router();

imageRouter.get('/news/:id', imageCtrl.route);

export default imageRouter;