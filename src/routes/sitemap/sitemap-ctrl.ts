import { Request, Response } from 'express';
import Post from '../../models/post';
import Community from '../../models/Community';
import News from '../../models/news';
import { catchErrorCtrl } from '../../lib/telegram';

const sitemapCtrl = {
  getSitemap: async (req: Request, res: Response) => {
    try {
      const { type } = req.query;
      if (!type) return res.status(400).json({ msg: 'Invalid request!' });
      switch (type) {
        case 'post': {
          const posts = await Post.find({}).sort({ createdAt: -1 });
          res.status(200).json(posts);
          break;
        }
        case 'community': {
          const communities = await Community.find({});
          res.status(200).json(communities);
          break;
        }
        case 'news': {
          const news = await News.find({});
          res.status(200).json(news);
          break;
        }
        default: {
          res.status(400).json({ msg: 'Invalid type!' });
        }
      }
    } catch (err) {
      catchErrorCtrl(err, res);
    }
  },
};

export default sitemapCtrl;
