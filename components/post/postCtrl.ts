import express from 'express'
import { getUserFromToken } from '../user/user-functions/userFunctions'
import Post from '../../models/Post'

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
    createPost: async (req:express.Request,res:express.Response) => {
         try {
            const {token} = req.cookies
            if (!token) {
                return res.status(401).json({msg: "You need to login first"})
            }
            const user = await getUserFromToken(token)
            const {title,body,image,community,communityIcon,isImage,imageHeight,imageWidth,imageId,sharePostToTG,sharePostToTwitter} = req.body
            const post = new Post({
                author: user?.username,
                authorAvatar: user?.avatar,
                title,
                body,
                image,
                community,
                communityIcon,
                imageId,
                mediaInfo: {
                    dimension: [imageHeight,imageWidth],
                    isImage
                }
            })
            const savedPost = await post.save()
            if (sharePostToTG) {

            }
         } catch (err:any) {
            res.status(500).json({msg: err.message})
         }
    }
}

export default PostCtrl