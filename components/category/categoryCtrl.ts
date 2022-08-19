import express from 'express';
import Category from '../../models/Category';

const categoryCtrl = {
    getCategories: async (req:express.Request,res:express.Response) => {
        try {
            const categories = await Category.find({})
            res.json(categories);
        } catch (err) {
            if (err instanceof Error)
            res.status(500).json({msg: err.message})
        }
    }
}

export default categoryCtrl;
