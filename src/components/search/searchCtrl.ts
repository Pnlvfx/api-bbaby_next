import Post from '../../models/Post';
import endOfDay from 'date-fns/endOfDay';
import { Request, Response } from 'express';
import coraline from '../../coraline/coraline';
import { catchErrorCtrl } from '../../coraline/cor-route/crlerror';

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
      const endOfDay = new Date(startOfDay).setUTCDate(new Date(startOfDay).getUTCDate() + 1);
      const posts = await Post.find({ createdAt: { $gte: new Date(startOfDay), $lt: new Date(endOfDay) } }).sort({ ups: -1 });
      console.log(posts);
      //res.set('Cache-control', 'public,max-age=3600');
      res.json(posts);
    } catch (err) {
      console.log(err);
      catchErrorCtrl(err, res)
    }
  },
};

export default searchCtrl;
