import { Router } from 'express';
import sitemapCtrl from './sitemapCtrl';

const sitemapRouter = Router();

sitemapRouter.get('/', sitemapCtrl.getSitemap);

export default sitemapRouter;
