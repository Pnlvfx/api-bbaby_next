import type {Request, Response} from 'express';
import type { UserRequest } from '../../@types/express';
import cloudinary from '../../lib/cloudinary';
import Community from '../../models/Community';
import Post from '../../models/Post';
import User from '../../models/User';
import { getUserFromToken } from '../user/user-functions/userFunctions';

const communityCtrl = {
    getCommunity: async (req:Request,res:Response) => {
        try {
            const {token} = req.cookies;
            const {name} = req.params;
            const regex = new RegExp(`^${name}$`, 'i')
            const community = await Community.findOne({name: regex})
            if (!community) return res.status(500).json({msg: "Something went wrong"})
            if (!token) {
                community.user_is_banned = false;
                community.user_is_contributor = false
                community.user_is_moderator = false
                community.user_is_subscriber = false
            } else {
                const user = await getUserFromToken(token)
                if (!user) return res.status(401).json({msg: "Your token is no more valid, please try to logout and login again."})
                const moderator = user.username === community.communityAuthor ? true : user.role === 1 ? true : false;
                const subscriber = await User.findOne({username: user.username, subscribed: name})
                const isSubscriber = subscriber ? true : false
                community.user_is_banned = false;
                community.user_is_contributor = false;
                community.user_is_moderator = moderator;
                community.user_is_subscriber = isSubscriber;
            }
            res.json(community);
        } catch (err) {
            if (err instanceof Error)
            res.status(500).json({msg: err.message})
        }
    },
    updateDescription: async(expressRequest:Request,res:Response) => {
        try {
            const req = expressRequest as UserRequest;
            const {user} = req;
            const {name,descr:description} = req.body;
            const c = await Community.findOneAndUpdate({name}, {description})
            if (!c) return res.status(500).json({msg: 'Something went wrong, please try again'})
            res.status(200).json('Description update successfully');
        } catch (err) {
            if (err instanceof Error)
            res.status(500).json({msg: err.message})
        }
    },
    getBestCommunities: async(req:Request,res:Response) => {
        try {
            const {token} = req.cookies;
            const {limit} = req.query;
            if (!limit) return res.status(400).json({msg: 'Please add a limit field into your query request.'})
            const communities = await Community.find({}).sort({number_of_posts: -1}).limit(parseInt(limit.toString()))
            if (!communities) return res.status(500).json({msg: "Something went wrong when trying to get the communities"})
            if (token) {
                const user = await getUserFromToken(token);
                if (!user) return res.status(401).json({msg: "Your token is no more valid, please try to logout and login again."});
                communities.map((community) => {
                    if (community.name === user.subscribed?.toString())
                    community.user_is_subscriber = true
                })
            }
            res.status(200).json(communities)
            } catch (err) {
                if (err instanceof Error)
                res.status(500).json({msg: err.message})
            }
    },
    createCommunity: async(expressRequest:Request,res:Response) => {
        try {
            const req = expressRequest as UserRequest;
            const {user} = req;
            const {name} = req.body;
            if (!name) return res.status(500).json({msg: "A community name is required"})
            const check = await Community.exists({name: new RegExp(`^${name}$`, 'i')})
            if (check) {
                return res.status(401).json({msg: `Sorry, b/${name} is taken. Try another.`})
            } else {
                const language = user.countryCode === 'IT' ? "Italian" : "English"
                const {region} = user
                const community = new Community({
                    name,
                    communityAuthor: user.username,
                    language,
                    region
                })
                const savedCommunity = await community.save()
                res.status(201).json({msg: "You have successfully created a new community"})
            }
        } catch (err) {
            if (err instanceof Error)
            res.status(500).json({msg: err.message})
        }
    },
    changeAvatar: async(expressRequest:Request,res:Response) => {
        try {
            const req = expressRequest as UserRequest;
            const {user} = req
            const {image} = req.body;
            const {name} = req.params;
            const response = await cloudinary.v2.uploader.upload(image, {height: 256, width: 256, crop: 'scale'})
            if (!response) return res.status(500).json({msg: 'Something went wrong with this image. Please try with another one'})
            const community = await Community.findOneAndUpdate({name}, {communityAvatar: response.secure_url})
            if(!community) return res.status(500).json({msg: 'Something went wrong with this image. Please try with another one'})
            const postThumb = await Post.updateMany({community: name}, {$set: {communityIcon: response.secure_url}})
            if(!postThumb) return res.status(500).json({msg: 'Something went wrong with this image. Please try with another one'})
            res.json({msg: "Image updated successfully"})
        } catch (err) {
            if (err instanceof Error)
            res.status(500).json({msg: err.message})
        }
    },
    subscribe: async (expressRequest:Request,res:Response) => {
        try {
            const req = expressRequest as UserRequest;
            const {community} = req.body;
            const {user} = req;
            const check = await User.findOne({username: user?.username, subscribed: community})
            if (check) {
                const unsubscribe = await User.findOneAndUpdate({username: user.username}, {$pull: {subscribed: community}})
                const subscribedCount = await Community.findOneAndUpdate({name: community}, {$inc: {subscribers: -1}})
                res.json({msg: `You have unfollowed ${community}`})
            } else {
                const subscribe = await User.findOneAndUpdate({username: user.username}, {$push: {subscribed: community}})
                const subscribedCount = await Community.findOneAndUpdate({name: community}, {$inc: {subscribers: +1}})
                res.json({msg: `You now follow ${community}`})
            }
        } catch (err) {
            if (err instanceof Error)
            res.status(500).json({msg: err.message})
        }
    },
    getUserPreferredCommunities: async(req:Request,res:Response) => {
        try {
            const {token} = req.cookies;
            const {limit} = req.query;
            if (!limit) return res.status(400).json({msg: 'Please add a limit field into your query request.'})
            let communities = [];
            if (token) {
                const user = await getUserFromToken(token)
                if (!user) return res.status(401).json({msg: "Your token is no more valid, please try to logout and login again."})
                const subscribedCommunities = await Community.find({name: user?.subscribed}).limit(parseInt(limit.toString()))
                if (!subscribedCommunities) return res.status(500).json({msg: "Something went wrong when trying to get the communities"})
                if (subscribedCommunities.length <= parseInt(limit.toString())) {
                    
                }
                res.json(subscribedCommunities)
            }
        } catch (err) {
            if (err instanceof Error)
            res.status(500).json({msg: err.message})
        }
    },
    chooseCategory : async(expressRequest:Request,res:Response) => {
        try {
            const req = expressRequest as UserRequest;
            const {user} = req;
            const {name} = req.params;
            const {category} = req.body;
            const c = await Community.findOne({name})
            const check = user.role === 1 ? true : user.username === c?.communityAuthor ? true : false
            if (!check) {
                return res.status(500).json({msg: "You need to be a moderator to do this action!"})
            } else {
                const update = await Community.findOneAndUpdate({name}, {category})
                res.json(true);
            }
        } catch (err) {
            if (err instanceof Error)
            res.status(500).json({msg: err.message})
        }
    },
    searchCommunity: async(expressRequest:Request,res:Response) => {
        try {
            const req = expressRequest as UserRequest;
            const {user} = req;
            const {phrase} = req.query;
            const name = {$regex: '.*'+ phrase +'.*', $options: 'i'}
            if (!phrase) return res.status(500).json({msg: "Please insert the name of the communities that you want to find"})
            const communities = await Community.find({name: name}).sort({subscribers: -1})
            // const filters = () => {
            //     let response = user.subscribed?.filter(sub => {
            //         return !communities.find(community => {

            //             return community.name === sub
            //         })
            //     })
            //     return response;
            // }
            // console.log(filters())
            res.json(communities)
        } catch (err) {
            if (err instanceof Error)
            res.status(500).json({msg: err.message})
        }
    },
}

export default communityCtrl;
