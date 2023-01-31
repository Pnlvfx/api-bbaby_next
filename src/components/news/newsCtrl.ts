import type { Request, Response } from 'express';
import News from '../../models/News';
import { catchErrorCtrl } from '../../coraline/cor-route/crlerror';
import { UserRequest } from '../../@types/express';

const newsCtrl = {
  getArticles: async (req: Request, res: Response) => {
    try {
      const { limit, skip } = req.query;
      if (!limit || !skip) return res.status(400).json({ msg: 'Please enter pagination parameters!' });
      const news = await News.find({}).sort({ createdAt: -1 }).limit(Number(limit)).skip(Number(skip));
      res.status(200).json(news);
    } catch (err) {
      catchErrorCtrl(err, res);
    }
  },
  getArticle: async (req: Request, res: Response) => {
    try {
      const { permalink: req_permalink } = req.params;
      const permalink = `/news/${req_permalink}`;
      const news = await News.findOne({ permalink });
      res.status(200).json(news);
    } catch (err) {
      catchErrorCtrl(err, res);
    }
  },
  editNews: async (userRequest: Request, res: Response) => {
    try {
      const req = userRequest as UserRequest;
      const { title, description } = req.body;
      const { permalink: req_permalink } = req.params;
      const permalink = `/news/${req_permalink}`;
      const news = await News.findOne({ permalink });
      if (!news) return res.status(400).json({ msg: "This news doesn't exist!" });
      news.title = title;
      news.description = description;
      await news.save();
      res.status(200).json(true);
    } catch (err) {
      catchErrorCtrl(err, res);
    }
  },
};

export default newsCtrl;
