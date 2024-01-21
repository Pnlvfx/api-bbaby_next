import { Request, Response } from 'express';
import Category from '../../models/category';
import { catchErrorCtrl } from '../../lib/telegram';

const categoryCtrl = {
  getCategories: async (req: Request, res: Response) => {
    try {
      const categories = await Category.find({});
      res.status(200).json(categories);
    } catch (err) {
      catchErrorCtrl(err, res);
    }
  },
};

export default categoryCtrl;
