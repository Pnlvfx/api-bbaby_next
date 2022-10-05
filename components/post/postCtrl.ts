import type {Request, Response} from 'express';
import type { UserRequest } from '../../@types/express';
import { getUserFromToken } from '../user/user-functions/userFunctions';
import Post from '../../models/Post';
import User from '../../models/User';
import { Types, isValidObjectId } from 'mongoose';
import cloudinary from '../../lib/cloudinary';
import Comment from '../../models/Comment';
import Community from '../../models/Community';
import { catchErrorCtrl } from '../../lib/common';
import coraline from '../../database/coraline';
import twitterapis from '../../lib/twitterapis';
import telegramapis from '../../lib/telegramapis';

const PostCtrl = {
    getPosts: async (req: Request,res: Response) => {
        try {
            const {token} = req.cookies;
            const userLang = req.acceptsLanguages('it', 'en');
            const {community: communityName, author, limit, skip} = req.query;
            if (!limit || !skip) return res.status(500).json({msg: "Limit and Skip parameters are required for this API."});
            const _skip = parseInt(skip.toString());
            const user_agent = req.useragent;
            const _limit = user_agent?.isMobile && _skip < 15 ? 7 : parseInt(limit.toString())
            const filters = communityName?.toString()
            ? {community: new RegExp(`^${communityName.toString()}$`, 'i')} 
            : author ? {author: new RegExp(`^${author}$`, 'i')} 
            : userLang !== 'it' ? {community: {'$nin': ['Italy', 'calciomercato', 'Calcio']}}
            : {community: ['Italy', 'calciomercato', 'Calcio']}
            const posts = await Post.find(filters).sort({createdAt: -1}).limit(_limit).skip(_skip)
            if (token) {
                const user = await getUserFromToken(token);
                posts.map((post) => {
                    if (user?.upVotes.find(upvote => upvote.toString() === post._id.toString())) post.liked = true;
                    if (user?.downVotes.find(downvote => downvote.toString() === post._id.toString())) post.liked = false;
                })
            }
            res.status(200).json(posts);
        } catch (err) {
            catchErrorCtrl(err, res);
        }
    },
    getPost: async (req: Request,res: Response) => {
        try {
            const {token} = req.cookies;
            const {id} = req.params;
            const check = isValidObjectId(id);
            if (!check) return res.status(400).json({msg: "This post not exists."});
            let post = await Post.findById(id);
            if (!post) return res.status(400).json({msg: "This post not exists."});
            if (token) {
                const user = await getUserFromToken(token);
                if (!user) return res.status(401).json({msg: "Your token is no more valid, please try to logout and login again."});
                const votedUp = {username: user?.username, upVotes: id}
                const votedDown = {username: user?.username, downVotes: id}
                const userUpVoted = await User.exists(votedUp)
                if (!userUpVoted) {
                    const userDownVoted = await User.exists(votedDown)
                    if (!userDownVoted) {
                        
                    } else {
                        post.liked = false
                    }
                } else {
                    post.liked = true
                }
            }
            res.json(post)
        } catch (err) {
            catchErrorCtrl(err, res);
        }
    },
    createPost: async (expressRequest: Request,res: Response) => {
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
            if (!title) return res.status(500).json({msg: "Title is required."});
            if (user.role !== 1 && title.toString().length > 300) return res.status(400).json({msg: 'Title needs to be 300 words maximum.'});
            if (!community || !communityIcon) return res.status(500).json({msg: "Please select a valid community."});
            const communityInfo = await Community.findOne({name: community});
            if (!communityInfo) return res.status(500).json({msg: "Please select a valid community."});
            const post = new Post({
                author: user?.username,
                authorAvatar: user?.avatar,
                title,
                body,
                community,
                communityIcon,
            });
            if (isImage) {
                const image = await cloudinary.v2.uploader.upload(selectedFile, {
                    upload_preset: 'bbaby_posts',
                    public_id: post._id.toString()
                })
                post.$set({mediaInfo: {isImage, image: image.secure_url, dimension: [height, width]}});
            }
            if (isVideo) {
                //const _video = await coraline.videos.saveVideo(`posts/${post._id.toString()}`, selectedFile, width, height); 
                const video = await cloudinary.v2.uploader.upload(selectedFile, {
                    upload_preset: 'bbaby_posts',
                    public_id: post._id.toString(),
                    resource_type: 'video',
                    quality: 'auto'
                })
                if (!video) return res.status(500).json({msg: 'Cloudinary error!'})
                post.$set({mediaInfo: {isVideo, video: {url: video.secure_url},dimension: [height, width]}})
            }
            const url = `https://www.bbabystyle.com/b/${post.community}/comments/${post._id}`;
            post.url = url;
            const savedPost = await post.save();
            if (sharePostToTwitter) {
                const govText = savedPost.title.substring(0, 200) + ' ' + url;
                const twitterText = user.role === 0 ? url : govText;
                if (!communityInfo.language) return res.status(400).json({msg: "This community doesn't have a language"});
                const twitterUser = twitterapis.chooseUser(user, savedPost, communityInfo.language);
                if (user.role === 1) {
                    if (isImage || isVideo) {
                        const type = isImage ? 'images' : 'videos';
                        const video = isVideo ? selectedFile.toString().split('?')[0] : null;
                        const isUrl = type === 'images'
                        ? coraline.urlisImage(selectedFile) 
                        : coraline.urlisVideo(video);
                        const public_id = `posts/${post._id.toString()}`;
                        const media = isUrl ? await coraline.getMediaFromUrl(selectedFile, public_id, type) : selectedFile;
                        const twimage = await twitterapis.uploadMedia(twitterUser, media?.filename ? media.filename : media);
                        await twitterapis.tweet(twitterUser, twitterText, twimage);
                    } else {
                        await twitterapis.tweet(twitterUser, twitterText);
                    }
                } else {
                    await twitterapis.tweet(twitterUser, twitterText);
                }
            }
            if (sharePostToTG) {
                const chat_id = savedPost.community === 'Italy' ? '@anonynewsitaly' : savedPost.community === 'calciomercato' || 'calcio' ? '@bbabystyle1' : '@bbaby_style';
                await telegramapis.sendMessage(chat_id, url);
            }
            const updateComNumber = communityInfo.$inc('number_of_posts', 1);
            res.status(201).json(savedPost)
            telegramapis.sendLog(`New post created from ${user.username}`);
            res.end();
         } catch (err) {
            catchErrorCtrl(err, res);
         }
    },
    voting: async (expressRequest: Request,res: Response) => {
        try {
            const req = expressRequest as UserRequest;
            const {user} = req;
            const {id} = req.params
            const _id = new Types.ObjectId(id)
            const {dir} = req.body
            const hasVotedUp = user.upVotes.find((vote => vote.toString() === id));
            const hasVotedDown = user.downVotes.find((vote => vote.toString() === id));
            const post = await Post.findById(id);
            if (!post) return res.status(400).json({msg: "This post doesn't exist!"});
            if (hasVotedUp) {
                if (dir === 1) {
                    const deletePrevVote = await User.findOneAndUpdate({upVotes: _id}, {$pull: {upVotes: _id}})
                    post.ups -= 1
                } else {
                    const deletePrevVote = await User.findOneAndUpdate({upVotes: _id}, {$pull: {upVotes: _id}})
                    const userVote = await User.findOneAndUpdate({username: user.username},{$push: {downVotes: _id}})
                    post.ups -= 2
                }
            } else if (hasVotedDown) {
                if (dir === 1) {
                    const deletePrevVote = await User.findOneAndUpdate({downVotes: _id}, {$pull: {downVotes: _id}})
                    const userVote = await User.findOneAndUpdate({username: user.username},{$push: {upVotes : _id}})
                    post.ups += 2
                } else {
                    const deletePrevVote = await User.findOneAndUpdate({downVotes: _id}, {$pull: {downVotes: _id}})
                    post.ups += 1
                }
            } else {
                if(dir === 1) {
                    const userVote = await User.findOneAndUpdate({username: user.username},{$push: {upVotes : _id}})
                    post.ups += 1
                } else {
                    const userVote = await User.findOneAndUpdate({username: user.username},{$push: {downVotes: _id}})
                    post.ups -= 1
                }
            }
            await post.save();
            res.status(200).json({vote: post.ups});
        } catch (err) {
            catchErrorCtrl(err, res);
        }
    },
    deletePost: async (expressRequest:Request,res:Response) => {
        try {
            const req = expressRequest as UserRequest;
            const {user} = req;
            const {id} = req.params;
            const post = await Post.findByIdAndDelete(id)
            if (post?.mediaInfo) {
                //const deleteImage = await cloudinary.v2.uploader.destroy(findPost.imageId)
            }
            const childComments = await Comment.deleteMany({rootId: id})
            res.json({msg: "Deleted success"});
        } catch (err) {
            res.status(500).json({msg: "Something went wrong"})
        }
    },
}

export default PostCtrl;