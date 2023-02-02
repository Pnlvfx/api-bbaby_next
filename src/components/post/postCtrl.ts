import type { Request, Response } from 'express';
import type { UserRequest } from '../../@types/express';
import { getUserFromToken } from '../user/user-functions/userFunctions';
import Post from '../../models/Post';
import User from '../../models/User';
import { Types, isValidObjectId } from 'mongoose';
import Comment from '../../models/Comment';
import Community from '../../models/Community';
import { catchErrorCtrl } from '../../coraline/cor-route/crlerror';
import bbabyapis from '../../lib/bbabyapis/bbabyapis';
import cloudinary from '../../config/cloudinary';

const PostCtrl = {
  getPosts: async (req: Request, res: Response) => {
    try {
      const { token } = req.cookies;
      const userLang = req.acceptsLanguages('it', 'en');
      const { community: communityName, author, limit, skip } = req.query;
      if (!limit || !skip) return res.status(500).json({ msg: 'Limit and Skip parameters are required for this API.' });
      const user_agent = req.useragent;
      const _limit = user_agent?.isMobile && Number(skip.toString()) < 15 ? 7 : parseInt(limit.toString());
      let filters = {};
      if (communityName) {
        filters = { community: new RegExp(`^${communityName.toString()}$`, 'i') };
      } else if (author) {
        filters = { author: new RegExp(`^${author}$`, 'i') };
      } else {
        const communities = await Community.find({ language: userLang ? userLang : 'en' });
        const selectedCommunities = Array.from(communities.map((community) => community.name));
        filters = { community: selectedCommunities };
      }
      let posts = await Post.find(filters).sort({ createdAt: -1 }).limit(_limit).skip(Number(skip));
      if (posts.length < _limit && !author && !communityName) {
        //home
        filters = {};
        posts = await Post.find(filters).sort({ createdAt: -1 }).limit(_limit).skip(Number(skip));
      }
      if (token) {
        const user = await getUserFromToken(token);
        posts.map((post) => {
          if (user?.upVotes.find((upvote) => upvote.toString() === post._id.toString())) post.liked = true;
          if (user?.downVotes.find((downvote) => downvote.toString() === post._id.toString())) post.liked = false;
        });
      }
      res.status(200).json(posts);
    } catch (err) {
      catchErrorCtrl(err, res);
    }
  },
  getPost: async (req: Request, res: Response) => {
    try {
      const { token } = req.cookies;
      const { id } = req.params;
      const check = isValidObjectId(id);
      if (!check) return res.status(400).json({ msg: 'This post not exists.' });
      const post = await Post.findById(id);
      if (!post) return res.status(400).json({ msg: 'This post not exists.' });
      if (token) {
        const user = await getUserFromToken(token);
        if (!user) return res.status(401).json({ msg: 'Your token is no more valid, please try to logout and login again.' });
        const votedUp = { username: user?.username, upVotes: id };
        const votedDown = { username: user?.username, downVotes: id };
        const userUpVoted = await User.exists(votedUp);
        if (!userUpVoted) {
          const userDownVoted = await User.exists(votedDown);
          if (!userDownVoted) {
            //
          } else {
            post.liked = false;
          }
        } else {
          post.liked = true;
        }
      }
      res.json(post);
    } catch (err) {
      catchErrorCtrl(err, res);
    }
  },
  createPost: async (expressRequest: Request, res: Response) => {
    try {
      const req = expressRequest as UserRequest;
      const { user } = req;
      const { title, community, body, selectedFile, isImage, isVideo, height, width, sharePostToTG, sharePostToTwitter } = req.body;
      if (!title) return res.status(500).json({ msg: 'Title is required.' });
      if (!community) return res.status(500).json({ msg: 'Please select a valid community.' });
      const savedPost = await bbabyapis.post.newPost(user, title, community, {
        body,
        height,
        isImage,
        isVideo,
        selectedFile,
        sharePostToTG,
        sharePostToTwitter,
        width,
      });
      res.status(201).json(savedPost);
    } catch (err) {
      catchErrorCtrl(err, res);
    }
  },
  voting: async (expressRequest: Request, res: Response) => {
    try {
      const req = expressRequest as UserRequest;
      const { user } = req;
      const { id } = req.params;
      const _id = new Types.ObjectId(id);
      const { dir } = req.body;
      const post = await Post.findById(id);
      if (!post) return res.status(400).json({ msg: "This post doesn't exist!" });
      const hasVotedUp = user.upVotes.find((vote) => vote.toString() === id);
      const hasVotedDown = user.downVotes.find((vote) => vote.toString() === id);
      if (hasVotedUp) {
        user.upVotes = user.upVotes.filter((_) => !_.equals(id));
        if (dir === 1) {
          post.ups -= 1;
        } else {
          user.downVotes.push(_id);
          post.ups -= 2;
        }
      } else if (hasVotedDown) {
        user.downVotes = user.downVotes.filter((_) => !_.equals(id));
        if (dir === 1) {
          user.upVotes.push(_id);
          post.ups += 2;
        } else {
          post.ups += 1;
        }
      } else {
        if (dir === 1) {
          user.upVotes.push(_id);
          post.ups += 1;
        } else {
          user.downVotes.push(_id);
          post.ups -= 1;
        }
      }
      await user.save();
      await post.save();
      res.status(200).json({ vote: post.ups });
    } catch (err) {
      catchErrorCtrl(err, res);
    }
  },
  deletePost: async (expressRequest: Request, res: Response) => {
    try {
      const req = expressRequest as UserRequest;
      const { id } = req.params;
      const post = await Post.findById(id);
      if (!post) return res.status(500).json({ msg: 'Something went wrong' });
      if (post.mediaInfo) {
        await cloudinary.v2.uploader.destroy(`posts/${post._id.toString()}`);
      }
      await post.delete();
      await Comment.deleteMany({ rootId: id });
      res.json(true);
    } catch (err) {
      catchErrorCtrl(err, res);
    }
  },
};

export default PostCtrl;
