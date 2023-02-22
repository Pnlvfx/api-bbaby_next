import { Request, Response } from 'express';
import Post from '../../models/Post';
import Community from '../../models/Community';
import News from '../../models/News';
import { catchErrorCtrl } from '../../coraline/cor-route/crlerror';

const sitemapCtrl = {
  getSitemap: async (req: Request, res: Response) => {
    try {
      const { type } = req.query;
      if (!type) return res.status(400).json({ msg: 'Invalid request!' });
      if (type === 'post') {
        const posts = await Post.find({}).sort({ createdAt: -1 });
        res.status(200).json(posts);
      } else if (type === 'community') {
        const communities = await Community.find({});
        res.status(200).json(communities);
      } else if (type === 'news') {
        const news = await News.find({});
        res.status(200).json(news);
      } else {
        res.status(400).json({ msg: 'Invalid type!' });
      }
    } catch (err) {
      catchErrorCtrl(err, res);
    }
  },
};

export default sitemapCtrl;
