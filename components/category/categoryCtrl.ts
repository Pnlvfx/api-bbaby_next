import { Request, Response } from 'express';
import { catchErrorCtrl } from '../../lib/common';
import Category from '../../models/Category';

const categoryCtrl = {
    getCategories: async (req: Request,res: Response) => {
        try {
            const categories = await Category.find({})
            res.status(200).json(categories);
        } catch (err) {
            catchErrorCtrl(err, res);
        }
    }
}

export default categoryCtrl;
