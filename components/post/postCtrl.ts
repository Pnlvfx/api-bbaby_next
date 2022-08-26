import type {Request, Response} from 'express';
import type { UserRequest } from '../../@types/express';
import { getUserFromToken } from '../user/user-functions/userFunctions';
import Post from '../../models/Post';
import User from '../../models/User';
import { Types, isValidObjectId } from 'mongoose';
import cloudinary from '../../lib/cloudinary';
import Comment from '../../models/Comment';
import { _sharePostToTwitter } from './post-functions/createPost';
import Community from '../../models/Community';
import telegramapis from '../../lib/telegramapis';
import { catchErrorCtrl } from '../../lib/common';
import coraline from '../../database/coraline';


const PostCtrl = {
    getPosts: async (req:Request,res:Response) => {
        try {
            const {token} = req.cookies;
            const userLang = req.acceptsLanguages('en', 'it')
            const {community,author,limit,skip} = req.query;
            if (!limit || !skip) return res.status(500).json({msg: "Limit and Skip parameters are required for this API."})
            const nullVote = await Post.find({}).updateMany({'liked' : null})
            if (token) {
                const user = await getUserFromToken(token)
                if (!user) return res.status(401).json({msg: "Your token is no more valid, please try to logout and login again."})
                const userUpVote = await Post.find({_id : {'$in': user?.upVotes}}).updateMany({"liked" : "true"})
                const userDownVote = await Post.find({_id : {'$in': user?.downVotes}}).updateMany({"liked" : "false"})
            }
            let filters:any = {}

            if (community) {
                filters.community = new RegExp(`^${community}$`, 'i')
            } else if (author) {
                filters.author = new RegExp(`^${author}$`, 'i')
            } else {
                if (userLang !== 'it') {
                    filters.community = {'$nin': ['Italy', 'calciomercato']}
                } else {
                    filters.community = ['Italy', 'calciomercato']
                }
            }
            const posts = await Post.find(filters).sort({createdAt: -1}).limit(parseInt(limit.toString())).skip(parseInt(skip.toString()))
            res.setHeader('Cache-Control', 'private, max-age=3600, must-revalidate')
            res.json(posts)
        } catch (err) {
            if (err instanceof Error)
            res.status(500).json({msg: err.message})
        }
    },
    getPost: async (req:Request,res:Response) => {
        try {
            const {token} = req.cookies;
            const {id} = req.params;
            const check = isValidObjectId(id);
            if (!check) return res.status(500).json({msg: "This post not exists."})
            let post = await Post.findByIdAndUpdate(id, {'liked': 'null'})
            if (!post) return console.log('error')
            if (token) {
                const user = await getUserFromToken(token)
                if (!user) return res.status(401).json({msg: "Your token is no more valid, please try to logout and login again."})
                const votedUp = {username: user?.username, upVotes: id}
                const votedDown = {username: user?.username, downVotes: id}
                const userUpVoted = await User.exists(votedUp)
                if (!userUpVoted) {
                    const userDownVoted = await User.exists(votedDown)
                    if (!userDownVoted) {
                        
                    } else {
                        post = await Post.findByIdAndUpdate(id, {liked: "false"})
                    }
                } else {
                    post = await Post.findByIdAndUpdate(id, {liked: "true"})
                }
                }
                post = await Post.findById(id)
            res.json(post)
        } catch (err) {
            if (err instanceof Error) {
            console.log(err)
            res.status(500).json({msg: err.message})
        }}
    },
    createPost: async (expressRequest:Request,res:Response) => {
         try {
            const req = expressRequest as UserRequest;
            const {user} = req;
            const {
                title, 
                body,
                community,
                communityIcon,
                selectedFile,
                isImage,
                isVideo,
                height,
                width,
                sharePostToTG,
                sharePostToTwitter
            } = req.body;
            if (!title) return res.status(500).json({msg: "Title is required."})
            if (!community || !communityIcon) return res.status(500).json({msg: "Please select a valid community."})
            const communityExist = await Community.exists({name: community})
            if (!communityExist) return res.status(500).json({msg: "Please select a valid community."})
            const post = new Post({
                author: user?.username,
                authorAvatar: user?.avatar,
                title,
                body,
                community,
                communityIcon,
            })
            if (isImage) {
                const image = await cloudinary.v2.uploader.upload(selectedFile, {
                    upload_preset: 'bbaby_posts',
                    public_id: post._id.toString()
                })
                post.$set({mediaInfo: {isImage,image:image.secure_url,dimension: [height,width]}})
            }
            if (isVideo) {
                const _video = await coraline.videos.saveVideo(post._id.toString(), selectedFile, width, height);
                const video = await cloudinary.v2.uploader.upload(selectedFile, {
                    upload_preset: 'bbaby_posts',
                    public_id: post._id.toString(),
                    resource_type: 'video'
                })
                post.$set({mediaInfo: {isVideo,video: {url: video.secure_url},dimension: [height,width]}})
            }
            const savedPost = await post.save()
            if (sharePostToTG) {
                const chat_id = savedPost.community === 'Italy' ? '@anonynewsitaly' : savedPost.community === 'calciomercato' ? '@bbabystyle1' : '@bbaby_style'
                const my_text = `https://bbabystyle.com/b/${savedPost.community}/comments/${savedPost._id}`
                await telegramapis.sendMessage(chat_id, my_text);
            }
            if (sharePostToTwitter) {
                await _sharePostToTwitter(user,savedPost,res)
            }
            const updateComNumber = await Community.findOneAndUpdate({name: post.community}, {$inc: {number_of_posts: +1}})
            res.status(201).json(savedPost)
            telegramapis.sendLog(`New post created from ${user.username}`)
         } catch (err) {
            catchErrorCtrl(err, res);
         }
    },
    voting: async (expressRequest:Request,res:Response) => {
        try {
            const req = expressRequest as UserRequest;
            const {user} = req;
            const {id} = req.params
            const _id = new Types.ObjectId(id)
            const {dir} = req.body

            const hasVotedUp = await User.findOne({username: user.username, upVotes: _id})
            const hasVotedDown = await User.findOne({username: user.username, downVotes: _id})

            if (hasVotedUp) {
                if (dir === 1) {
                    const deletePrevVote = await User.findOneAndUpdate({upVotes: _id}, {$pull: {upVotes: _id}})
                    const post = await Post.findByIdAndUpdate(_id, {$inc: {ups: -1}})
                    res.status(200).json({vote: post ? post.ups -1 : 0})
                } else {
                    const deletePrevVote = await User.findOneAndUpdate({upVotes: _id}, {$pull: {upVotes: _id}})
                    const userVote = await User.findOneAndUpdate({username: user.username},{$push: {downVotes: _id}})
                    const post = await Post.findByIdAndUpdate(_id, {$inc : {ups : -2}})
                    res.status(200).json({vote: post ? post.ups -2 : 0})
                }
            } else if (hasVotedDown) {
                if (dir === 1) {
                    const deletePrevVote = await User.findOneAndUpdate({downVotes: _id}, {$pull: {downVotes: _id}})
                    const userVote = await User.findOneAndUpdate({username: user.username},{$push: {upVotes : _id}})
                    const post = await Post.findByIdAndUpdate(_id, {$inc : {ups : +2}})
                    res.status(200).json({vote: post ? post.ups +2 : 0})
                } else {
                    const deletePrevVote = await User.findOneAndUpdate({downVotes: _id}, {$pull: {downVotes: _id}})
                    const post = await Post.findByIdAndUpdate(id, {$inc : {ups : +1}})
                    res.status(200).json({vote: post ? post.ups +1 : 0})
                }
            } else {
                if(dir === 1) {
                    const userVote = await User.findOneAndUpdate({username: user.username},{$push: {upVotes : _id}})
                    const post = await Post.findByIdAndUpdate(_id, {$inc : {ups : +1}})
                    res.status(200).json({vote: post ? post.ups + 1: 0})
                } else {
                    const post = await Post.findByIdAndUpdate(_id, {$inc : {ups : -1}})
                    const userVote = await User.findOneAndUpdate({username: user.username},{$push: {downVotes: _id}})
                    res.status(200).json({vote: post ? post.ups -1 : 0})
                }
            }
        } catch (err) {
            if (err instanceof Error)
            res.status(500).json({msg: err.message})
        }
    },
    deletePost: async (expressRequest:Request,res:Response) => {
        try {
            const req = expressRequest as UserRequest;
            const {user} = req;
            const {id} = req.params;
            const findPost = await Post.findByIdAndDelete(id)
            if (findPost && findPost.mediaInfo) {
                //const deleteImage = await cloudinary.v2.uploader.destroy(findPost.imageId)
            }
            const findChildComments = await Comment.deleteMany({rootId: id})
            res.json({msg: "Deleted success"})
        } catch (err) {
            res.status(500).json({msg: "Something went wrong"})
        }
    },
    getSSRposts: async (expressRequest:Request,res:Response) => {
        try {
            const req = expressRequest as UserRequest;
            const {token} = req.cookies;
            const userLang = req.acceptsLanguages('en', 'it')
            const {community,author,limit,skip} = req.query;
            if (!limit || !skip) return res.status(500).json({msg: "Limit and Skip parameters are required for this API."});
            let posts = await Post.find({})
        } catch (err) {
            catchErrorCtrl(err, res);
        }
    }
}

export default PostCtrl;