import type { Request, Response } from 'express';
import type { UserRequest } from '../../@types/express';
import cloudinary from '../../config/cloudinary';
import Community from '../../models/Community';
import Post from '../../models/post';
import User from '../../models/user';
import bbabycommunity from '../../lib/bbabyapis/route/bbabycommunity/bbabycommunity';
import userapis from '../../lib/userapis/userapis';
import { catchErrorCtrl } from '../../lib/telegram';
import coraline from 'coraline';

const communityCtrl = {
  getCommunities: async (req: Request, res: Response) => {
    try {
      const { token } = req.cookies;
      const { limit } = req.query;
      if (!limit) return res.status(400).json({ msg: 'Please add a limit field into your query request.' });
      const communities = await Community.find({}).sort({ number_of_posts: -1 }).limit(Number(limit.toString()));
      if (token) {
        const user = await userapis.getUserFromToken(token);
        if (!user) return res.status(401).json({ msg: 'Your token is no more valid, please try to logout and login again.' });
        communities.map((community) => {
          if (user.subscribed?.find((sub) => sub === community.name)) community.user_is_subscriber = true;
        });
      }
      res.status(200).json(communities);
    } catch (err) {
      catchErrorCtrl(err, res);
    }
  },
  getCommunity: async (req: Request, res: Response) => {
    try {
      const { token } = req.cookies;
      const { name } = req.params;
      const community = await bbabycommunity.getCommunity(token, name);
      res.status(200).json(community);
    } catch (err) {
      catchErrorCtrl(err, res);
    }
  },
  searchCommunity: async (expressRequest: Request, res: Response) => {
    try {
      const req = expressRequest as UserRequest;
      const { phrase } = req.query;
      const name = { $regex: '.*' + phrase + '.*', $options: 'i' };
      if (!phrase) return res.status(500).json({ msg: 'Please insert the name of the communities that you want to find' });
      const communities = await Community.find({ name: name }).sort({ subscribers: -1 });
      // const filters = () => {
      //     let response = user.subscribed?.filter(sub => {
      //         return !communities.find(community => {

      //             return community.name === sub
      //         })
      //     })
      //     return response;
      // }
      res.status(200).json(communities);
    } catch (err) {
      catchErrorCtrl(err, res);
    }
  },
  updateDescription: async (expressRequest: Request, res: Response) => {
    try {
      const req = expressRequest as UserRequest;
      const { name, descr: description } = req.body;
      const c = await Community.findOneAndUpdate({ name: coraline.regex.upperLowerCase(name) }, { description });
      if (!c) return res.status(500).json({ msg: 'Something went wrong, please try again' });
      res.status(200).json(true);
    } catch (err) {
      if (err instanceof Error) res.status(500).json({ msg: err.message });
    }
  },
  getUserPreferredCommunities: async (expressRequest: Request, res: Response) => {
    try {
      const req = expressRequest as UserRequest;
      const { user, query } = req;
      const { limit } = query;
      if (!limit) return res.status(400).json({ msg: 'Please add a limit field into your query request.' });
      const _limit = Number(limit.toString());
      let communities = await Community.find({ name: user.subscribed }).limit(_limit);
      const ids = communities.map((_) => _.id);
      if (communities.length < _limit) {
        const newCommunities = await Community.find({ _id: { $nin: ids } })
          .limit(_limit - communities.length)
          .sort({ createdAt: -1 });
        communities = [...communities, ...newCommunities];
      }
      res.status(200).json(communities);
    } catch (err) {
      catchErrorCtrl(err, res);
    }
  },
  createCommunity: async (expressRequest: Request, res: Response) => {
    try {
      const req = expressRequest as UserRequest;
      const { user, body } = req;
      const { name } = body;
      if (!name) return res.status(500).json({ msg: 'A community name is required' });
      await bbabycommunity.createCommunity(user, name);
      res.status(201).json({ msg: 'You have successfully created a new community' });
    } catch (err) {
      catchErrorCtrl(err, res);
    }
  },
  changeAvatar: async (expressRequest: Request, res: Response) => {
    try {
      const req = expressRequest as UserRequest;
      const { image } = req.body;
      if (!image) return res.status(401).json({ msg: 'No image were provided!' });
      const { name } = req.params;
      const response = await cloudinary.v2.uploader.upload(image, {
        height: 256,
        width: 256,
        crop: 'scale',
        upload_preset: 'bbaby_community',
      });
      const community = await Community.findOne({ name: coraline.regex.upperLowerCase(name) });
      if (!community) return res.status(500).json({ msg: 'Invalid community!' });
      community.image = response.secure_url;
      await Post.updateMany({ community: name }, { $set: { communityIcon: response.secure_url } });
      await community.save();
      res.status(200).json({ msg: 'Image updated successfully' });
    } catch (err) {
      catchErrorCtrl(err, res);
    }
  },
  subscribe: async (expressRequest: Request, res: Response) => {
    try {
      const req = expressRequest as UserRequest;
      const { community } = req.body;
      const { user } = req;
      const communityInfo = await Community.findOne({ name: community });
      if (!communityInfo) return res.status(400).json({ msg: "Invalid community! This community doesn't exist or has been deleted!" });
      const block = user.username === communityInfo?.author ? true : false;
      if (block) return res.status(400).json({ msg: 'You cannot unsubscribe from your own communities!' });
      const check = user.subscribed?.find((sub) => sub === community);
      if (check) {
        await User.findOneAndUpdate({ username: user.username }, { $pull: { subscribed: community } });
        communityInfo.subscribers -= 1;
      } else {
        await User.findOneAndUpdate({ username: user.username }, { $push: { subscribed: community } });
        communityInfo.subscribers += 1;
      }
      await communityInfo.save();
      res.status(200).json(true);
    } catch (err) {
      catchErrorCtrl(err, res);
    }
  },
  chooseCategory: async (expressRequest: Request, res: Response) => {
    try {
      const req = expressRequest as UserRequest;
      const { user, params, body } = req;
      const { name } = params;
      const { category } = body;
      const community = await Community.findOne({ name });
      if (!community) return res.status(500).json({ msg: "This community doesn't exist!" });
      const check = user.role === 1 || user.username === community.author ? true : false;
      if (!check) return res.status(500).json({ msg: 'You need to be a moderator to do this action!' });
      community.category = category;
      await community.save();
      res.status(200).json(true);
    } catch (err) {
      catchErrorCtrl(err, res);
    }
  },
};

export default communityCtrl;
