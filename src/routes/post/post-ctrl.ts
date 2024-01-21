/* eslint-disable unicorn/no-null */
/* eslint-disable sonarjs/no-duplicate-string */
import type { Request, Response } from 'express';
import type { UserRequest } from '../../@types/express';
import Post from '../../models/post';
import { Types, isValidObjectId } from 'mongoose';
import Comment from '../../models/comment';
import cloudinary from '../../config/cloudinary';
import bbabypost from '../../lib/bbabyapis/route/bbabypost/bbabypost';
import bbabycommunity from '../../lib/bbabyapis/route/bbabycommunity/bbabycommunity';
import userapis from '../../lib/userapis/userapis';
import { catchErrorCtrl } from '../../lib/telegram';

const postCtrl = {
  getPosts: async (req: Request, res: Response) => {
    try {
      const { token } = req.cookies;
      const userLang = req.acceptsLanguages('it', 'en') || 'en';
      const { community: communityName, author, limit, skip } = req.query;
      if (!limit || !skip) return res.status(500).json({ msg: 'Limit and Skip parameters are required for this API.' });
      const posts = await bbabypost.getPosts(userLang, Number(limit.toString()), Number(skip.toString()), { createdAt: -1 }, req.useragent, token, {
        author: author?.toString(),
        community: communityName?.toString(),
      });
      res.status(200).json(posts);
    } catch (err) {
      catchErrorCtrl(err, res);
    }
  },
  getHotPosts: async (req: Request, res: Response) => {
    try {
      const { token } = req.cookies;
      const userLang = req.acceptsLanguages('it', 'en') || 'en';
      const { community: communityName, author, limit, skip } = req.query;
      if (!limit || !skip) return res.status(500).json({ msg: 'Limit and Skip parameters are required for this API.' });
      const posts = await bbabypost.getPosts(userLang, Number(limit.toString()), Number(skip.toString()), { ups: -1 }, req.useragent, token, {
        author: author?.toString(),
        community: communityName?.toString(),
      });
      res.status(200).json(posts);
    } catch (err) {
      catchErrorCtrl(err, res);
    }
  },
  getNewPosts: async (req: Request, res: Response) => {
    try {
      const { token } = req.cookies;
      const userLang = req.acceptsLanguages('it', 'en') || 'en';
      const { community: communityName, author, limit, skip } = req.query;
      if (!limit || !skip) return res.status(500).json({ msg: 'Limit and Skip parameters are required for this API.' });
      const posts = await bbabypost.getPosts(userLang, Number(limit.toString()), Number(skip.toString()), { createdAt: -1 }, req.useragent, token, {
        author: author?.toString(),
        community: communityName?.toString(),
      });
      res.status(200).json(posts);
    } catch (err) {
      catchErrorCtrl(err, res);
    }
  },
  getTopPosts: async (req: Request, res: Response) => {
    try {
      const { token } = req.cookies;
      const userLang = req.acceptsLanguages('it', 'en') || 'en';
      const { community: communityName, author, limit, skip } = req.query;
      if (!limit || !skip) return res.status(500).json({ msg: 'Limit and Skip parameters are required for this API.' });
      const posts = await bbabypost.getPosts(userLang, Number(limit.toString()), Number(skip.toString()), { numComments: -1 }, req.useragent, token, {
        author: author?.toString(),
        community: communityName?.toString(),
      });
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
        const user = await userapis.getUserFromToken(token);
        if (!user) return res.status(401).json({ msg: 'Your token is no more valid, please try to logout and login again.' });
        if (user.upVotes.some((_) => _.equals(id))) {
          post.liked = true;
        } else if (user.downVotes.some((_) => _.equals(id))) {
          post.liked = false;
        } else {
          post.liked = null;
        }
      }
      const community = await bbabycommunity.getCommunity(token, post.community);
      post.community_detail = community;
      res.status(200).json(post);
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
      const post = await bbabypost.newPost(user, title, community, {
        body,
        height,
        isImage,
        isVideo,
        selectedFile,
        sharePostToTG,
        sharePostToTwitter,
        width,
      });
      res.status(201).json(post);
    } catch (err) {
      catchErrorCtrl(err, res);
    }
  },
  voting: async (expressRequest: Request, res: Response) => {
    try {
      const req = expressRequest as UserRequest;
      const { user, params, body } = req;
      const _id = new Types.ObjectId(params.id);
      const { dir } = body;
      const post = await Post.findById(params.id);
      if (!post) return res.status(400).json({ msg: "This post doesn't exist!" });
      const hasVotedUp = user.upVotes.find((vote) => vote.equals(_id));
      const hasVotedDown = user.downVotes.find((vote) => vote.equals(_id));
      if (hasVotedUp) {
        user.upVotes = user.upVotes.filter((_) => !_.equals(_id));
        if (dir === 1) {
          post.ups -= 1;
        } else {
          user.downVotes.push(_id);
          post.ups -= 2;
        }
      } else if (hasVotedDown) {
        user.downVotes = user.downVotes.filter((_) => !_.equals(_id));
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
      await post.deleteOne();
      await Comment.deleteMany({ rootId: id });
      res.json(true);
    } catch (err) {
      catchErrorCtrl(err, res);
    }
  },
};

export default postCtrl;
