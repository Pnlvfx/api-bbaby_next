import Post from '../../models/Post';
import endOfDay from 'date-fns/endOfDay';
import startOfDay from 'date-fns/startOfDay';
import { Request, Response } from 'express';

const searchCtrl = {
    search: async (req: Request, res: Response) => {
        try {
            const {phrase} = req.query;
            const posts = await Post.find({title: {$regex: '.*'+ phrase +'.*', $options: 'i'}}).sort({createdAt: -1})
            if (!posts) return res.status(500).json({msg: "No posts exists"})
            //Community.find({name:{$regex: '.*'+phrase+'.*'}})
            res.json(posts)
        } catch (err) {
            if (err instanceof Error)
            res.status(500).json({msg: err.message})
        }
    },
    searchTrend: async (req: Request, res: Response) => {
        try {
            const posts = await Post.find({createdAt: {$gte: startOfDay(new Date()),$lt: endOfDay(new Date())}}).sort({ups: -1})
            res.set('Cache-control', 'public,max-age=3600')
            res.json(posts)
        } catch (err) {
            if (err instanceof Error)
            res.status(500).json({msg: err.message})
        }
    },
}

export default searchCtrl;