import express from 'express'
import Post from '../../models/Post';
import endOfDay from 'date-fns/endOfDay';
import startOfDay from 'date-fns/startOfDay';

const searchCtrl = {
    search: async (req:express.Request, res: express.Response) => {
        try {
            const {phrase} = req.query;
            const posts = await Post.find({title: {$regex: '.*'+ phrase +'.*', $options: 'i'}}).sort({createdAt: -1})
            if (!posts) return res.status(500).json({msg: "No posts exists"})
            //Community.find({name:{$regex: '.*'+phrase+'.*'}})
            res.json(posts)
        } catch (err:any) {
            res.status(500).json({msg: err.message})
        }
    },
    searchTrend: async (req:express.Request, res: express.Response) => {
        try {
            const posts = await Post.find({createdAt: {$gte: startOfDay(new Date()),$lt: endOfDay(new Date())}}).sort({ups: -1})
            res.json(posts)
        } catch (err:any) {
            res.status(500).json({msg: err.message})
        }
    }
}

export default searchCtrl;