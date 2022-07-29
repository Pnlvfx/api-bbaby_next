import express from 'express'
import { getUserFromToken } from '../user/user-functions/userFunctions'
import Post from '../../models/Post'
import User from '../../models/User'
import { Types } from 'mongoose'
import cloudinary from '../../lib/cloudinary'
import Comment from '../../models/Comment'
import { sharePostToTelegram, _sharePostToTwitter } from './post-functions/createPost'
import Community from '../../models/Community'

const PostCtrl = {
    getPosts: async (req:express.Request,res:express.Response) => {
        try {
            const {token} = req.cookies
            const userLang = req.acceptsLanguages('en', 'it')
            const {community,author,limit,skip} = req.query
            if (token) {
                const user = await getUserFromToken(token)
                const userNullVote = await Post.find({_id: {'$nin': user?.downVotes && user?.upVotes}}).updateMany({'liked': 'null'})
                const userUpVote = await Post.find({_id : {'$in': user?.upVotes}}).updateMany({"liked" : "true"})
                const userDownVote = await Post.find({_id : {'$in': user?.downVotes}}).updateMany({"liked" : "false"})
            } else {
                const nullVote = await Post.find({}).updateMany({'liked' : null})
            }
            let filters:any = {}

            if (community) {
                filters.community = community
            } else if (author) {
                filters.author = author
            } else {
                if (userLang !== 'it') {
                    filters.community = {'$nin': ['Italy', 'calciomercato']}
                } else {
                    filters.community = ['Italy', 'calciomercato']
                }
            }
            const _limit:number = limit ? +limit : 0
            const _skip:number = skip ? +skip : 0
            const posts = await Post.find(filters).sort({createdAt: -1}).limit(_limit).skip(_skip)
            //res.setHeader('Cache-Control', 'private, max-age=3600')
            res.json(posts)   
        } catch (err:any) {
            res.status(500).json({msg: err.message})
        }
    },
    getPost: async (req:express.Request,res:express.Response) => {
        const {token} = req.cookies
        const {id} = req.params
        let post = await Post.findByIdAndUpdate(id, {'liked': 'null'})
        if (token) {
            const user = await getUserFromToken(token)
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
    },
    createPost: async (req:express.Request,res:express.Response) => {
         try {
            const {token} = req.cookies
            if (!token) {
                return res.status(401).json({msg: "You need to login first"})
            }
            const user = await getUserFromToken(token)
            const {title,body,community,communityIcon,selectedFile,isImage,isVideo,height,width,sharePostToTG,sharePostToTwitter} = req.body;
            if (!title) return res.status(500).json({msg: "Title is required."})
            if (!community || !communityIcon) return res.status(500).json({msg: "Please select a valid community."})
            const communityExist = await Community.exists({name: community})
            if (!communityExist) return res.status(500).json({msg: "Please select a valid community."})
            let image:any = {}
            let video:any = {}
            const post = new Post({
                author: user?.username,
                authorAvatar: user?.avatar,
                title,
                body,
                community,
                communityIcon,
            })
            let savedPost:any = await post.save()
            if (isImage) {
                image = await cloudinary.v2.uploader.upload(selectedFile, {
                    upload_preset: 'bbaby_posts',
                    public_id: savedPost._id.toString()
                })
                savedPost = await Post.findByIdAndUpdate({_id: savedPost._id}, {$set: {mediaInfo: {isImage:isImage,image:image.secure_url,dimension: [height,width]}}})
            }
            if (isVideo) {
                video = await cloudinary.v2.uploader.upload(selectedFile, {
                    upload_preset: 'bbaby_posts',
                    public_id: savedPost._id.toString(),
                    resource_type: 'video'
                })
                savedPost = await Post.findByIdAndUpdate({_id: savedPost._id}, {$set: {mediaInfo: {isVideo:isVideo,video: {url: video.secure_url},dimension: [height,width]}}})
            }
            if (sharePostToTG) {
                await sharePostToTelegram(savedPost,res)
            }
            if (sharePostToTwitter) {
                await _sharePostToTwitter(user,savedPost,res)
            }
            if (!savedPost) return res.status(401).json({msg: 'Something went wrong!'})
            savedPost = await Post.findById(savedPost._id)
            const updateComNumber = await Community.findOneAndUpdate({name: savedPost.community}, {$inc: {number_of_posts: +1}})
                res.status(201).json(savedPost)
         } catch (err:any) {
            res.status(500).json({msg: err.message})
         }
    },
    voting: async (req:express.Request,res:express.Response) => {
        try {
            const token = req.cookies.token ? req.cookies.token : null
            if (!token) return res.status(401).json({msg: "You need to login first"})
            const user = await getUserFromToken(token)
            const {id} = req.params
            const _id = new Types.ObjectId(id)
            const {dir} = req.body

            const hasVotedUp = await User.findOne({username: user?.username, upVotes: _id})
            const hasVotedDown = await User.findOne({username: user?.username, downVotes: _id})

            if (hasVotedUp) {
                if (dir === 1) {
                    const deletePrevVote = await User.findOneAndUpdate({upVotes: _id}, {$pull: {upVotes: _id}})
                    const post = await Post.findByIdAndUpdate(_id, {$inc: {ups: -1}})
                    res.status(200).json({vote: post ? post.ups -1 : 0})
                } else {
                    const deletePrevVote = await User.findOneAndUpdate({upVotes: _id}, {$pull: {upVotes: _id}})
                    const userVote = await User.findOneAndUpdate({username: user?.username},{$push: {downVotes: _id}})
                    const post = await Post.findByIdAndUpdate(_id, {$inc : {ups : -2}})
                    res.status(200).json({vote: post ? post.ups -2 : 0})
                }
            } else if (hasVotedDown) {
                if (dir === 1) {
                    const deletePrevVote = await User.findOneAndUpdate({downVotes: _id}, {$pull: {downVotes: _id}})
                    const userVote = await User.findOneAndUpdate({username: user?.username},{$push: {upVotes : _id}})
                    const post = await Post.findByIdAndUpdate(_id, {$inc : {ups : +2}})
                    res.status(200).json({vote: post ? post.ups +2 : 0})
                } else {
                    const deletePrevVote = await User.findOneAndUpdate({downVotes: _id}, {$pull: {downVotes: _id}})
                    const post = await Post.findByIdAndUpdate(id, {$inc : {ups : +1}})
                    res.status(200).json({vote: post ? post.ups +1 : 0})
                }
            } else {
                if(dir === 1) {
                    const userVote = await User.findOneAndUpdate({username: user?.username},{$push: {upVotes : _id}})
                    const post = await Post.findByIdAndUpdate(_id, {$inc : {ups : +1}})
                    res.status(200).json({vote: post ? post.ups + 1: 0})
                } else {
                    const post = await Post.findByIdAndUpdate(_id, {$inc : {ups : -1}})
                    const userVote = await User.findOneAndUpdate({username: user?.username},{$push: {downVotes: _id}})
                    res.status(200).json({vote: post ? post.ups -1 : 0})
                }
            }
        } catch (err:any) {
            res.status(500).json({msg: err.message})
        }
    },
    deletePost: async (req:express.Request,res:express.Response) => {
        try {
            const {id} = req.params
            const findPost = await Post.findByIdAndDelete(id)
            if (findPost && findPost.mediaInfo) {
                //const deleteImage = await cloudinary.v2.uploader.destroy(findPost.imageId)
            }
            const findChildComments = await Comment.deleteMany({rootId: id})
            res.json({msg: "Deleted success"})
        } catch (err) {
            res.status(500).json({msg: "Something went wrong"})
        }
    }
}

export default PostCtrl;