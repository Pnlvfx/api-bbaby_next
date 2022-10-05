import type {Request, Response} from 'express';
import News from '../../models/News';

const newsCtrl = {
    getNews: async (req: Request, res: Response) => {
        try {
            const news = await News.find({}).sort({createdAt: -1})
            res.status(200).json(news);
        } catch (err) {
            if (err instanceof Error)
            res.status(500).json({msg: err.message});
        }
    },
    getOneNews: async (req: Request, res: Response) => {
        try {
            const {title} = req.params;
            const regex = new RegExp(`^${title}$`, 'i')
            const news = await News.findOne({title: regex});
            res.status(200).json(news);
        } catch (err) {
            if (err instanceof Error)
            res.status(500).json({msg: err.message});
        }
    },
}

export default newsCtrl;