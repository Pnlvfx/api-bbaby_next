import { Router } from 'express';
import sitemapCtrl from './sitemap-ctrl';

const sitemapRouter = Router();

sitemapRouter.get('/', sitemapCtrl.getSitemap);

export default sitemapRouter;
