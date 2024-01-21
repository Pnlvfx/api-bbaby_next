import coraline from 'coraline';
import Post from '../../models/post';
import type { Request, Response } from 'express';
import { catchErrorCtrl } from '../../lib/telegram';

const searchCtrl = {
  search: async (req: Request, res: Response) => {
    try {
      const { phrase } = req.query;
      const posts = await Post.find({ title: { $regex: '.*' + phrase + '.*', $options: 'i' } }).sort({ createdAt: -1 });
      if (!posts) return res.status(500).json({ msg: 'No posts exists' });
      //Community.find({name:{$regex: '.*'+phrase+'.*'}})
      res.json(posts);
    } catch (err) {
      if (err instanceof Error) res.status(500).json({ msg: err.message });
    }
  },
  searchTrend: async (req: Request, res: Response) => {
    try {
      const startOfDay = coraline.date.startOfDay(new Date());
      const endOfDay = coraline.date.endOfDay(new Date());
      const posts = await Post.find({ createdAt: { $gte: startOfDay, $lt: endOfDay } }).sort({ ups: -1 });
      res.json(posts);
    } catch (err) {
      catchErrorCtrl(err, res);
    }
  },
};

export default searchCtrl;
