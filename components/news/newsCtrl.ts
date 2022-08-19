import type {Request, Response} from 'express';
import News from '../../models/News';

const newsCtrl = {
    getNews: async (req: Request, res: Response) => {
        try {
            console.log('here')
            const news = await News.find({}).sort({createdAt: -1})
            res.status(200).json(news);
        } catch (err) {
            if (err instanceof Error)
            res.status(500).json({msg: err.message});
        }
    },
    getOneNews: async (req: Request, res: Response) => {
        try {
            const {id} = req.params;
            const news = await News.findById(id);
            res.status(200).json(news);
        } catch (err) {
            if (err instanceof Error)
            res.status(500).json({msg: err.message});
        }
    }
}

export default newsCtrl;