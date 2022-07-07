import express from 'express'
import Community from '../../models/Community'
import { getUserFromToken } from '../user/user-functions/userFunctions'
const communityCtrl = {
    createCommunity: async(req:express.Request,res:express.Response) => {
        try {
            const {name,communityAvatar,cover} = req.body   
        } catch (err) {
            
        }
    },
    getCommunities: async(req:express.Request,res:express.Response) => {
        try {
            const {limit} = req.query
            const _limit:number = limit ? +limit : 0
            const communities = await Community.find({}).sort({}).limit(_limit)
            if (!communities) return res.status(500).json({msg: "Something went wrong when trying to get the communities"})
            res.json(communities)   
        } catch (err:any) {
            res.status(500).json({msg: err.message})
        }
    },
    getBestCommunities: async(req:express.Request,res:express.Response) => {
        try {
            const token = req.cookies?.token ? req.cookies.token : null
            const {limit} = req.query
            const _limit:number = limit ? +limit : 0
            const sort = {number_of_posts: -1}
            const notSub = await Community.updateMany({}, {user_is_subscriber: false}).sort({number_of_posts: -1}).limit(_limit)
            if (token) {
                const user = await getUserFromToken(token)
                const subscribed = await Community.updateMany({name: user?.subscribed}, {user_is_subscriber: true}).sort({number_of_posts: -1}).limit(_limit)
            }
            const communities = await Community.find({}).sort({number_of_posts: -1}).limit(_limit)
            if (!communities) return res.status(500).json({msg: "Something went wrong when trying to get the communities"})
            res.json(communities)
            } catch (err:any) {
                res.status(500).json({msg: err.message})
            }
    },
    getCommunity: async(req:express.Request,res:express.Response) => {
        try {
            const token = req.cookies?.token ? req.cookies.token : null
            const {name} = req.params
            if (token) {
                const user = await getUserFromToken(token)
                const _community = await Community.findOne({name})
                const moderator = user?.username === _community?.communityAuthor ? true : user?.role === 1 ? true : false
                const edit = await Community.findOneAndUpdate({name}, {user_is_moderator: moderator})
                const community = await Community.findOne({name})
                if (!community) return res.status(500).json({msg: "Something went wrong"})
                res.json(community);
            }
        } catch (err:any) {
            res.status(500).json({msg: err.message})
        }
    },
}

export default communityCtrl