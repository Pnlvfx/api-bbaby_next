import cloudinary from '../../../../config/cloudinary';
import Community from '../../../../models/Community';
import Post from '../../../../models/post';
import { IUser } from '../../../../models/types/user';
import { shareToTwitter } from './create-post';
import { Details } from 'express-useragent';
import { PostProps } from '../../../../models/types/post';
import userapis from '../../../userapis/userapis';
import { SortOrder } from 'mongoose';
import { sendLog, telegram } from '../../../telegram';
import coraline from 'coraline';

const bbabypost = {
  newPost: async (user: IUser, title: string, community: string, options?: PostOptions) => {
    if (user.role !== 1 && title.length > 300) throw new Error('Title needs to be 300 words maximum.');
    if (!title || title.length === 0) throw new Error('Title is too short, try something different!');
    const communityInfo = await Community.findOne({ name: coraline.regex.upperLowerCase(community) });
    if (!communityInfo) throw new Error('Please select a valid community.');
    const exist = await Post.exists({ title, author: user.username, community });
    if (exist) throw new Error('This post already exist.');
    const post = new Post({
      author: user.username,
      authorAvatar: user.avatar,
      title,
      community,
      communityIcon: communityInfo.image,
      body: options?.body,
    });
    if (options?.isImage && options?.selectedFile && options.width && options.height) {
      const image = await cloudinary.v2.uploader.upload(options.selectedFile, {
        upload_preset: 'bbaby_posts',
        public_id: post._id.toString(),
      });
      post.mediaInfo.isImage = options.isImage;
      post.mediaInfo.image = image.secure_url;
      post.mediaInfo.dimension.push(Number(options.height), Number(options.width));
    }
    if (options?.isVideo && options?.selectedFile && options.width && options.height) {
      const video = await cloudinary.v2.uploader.upload(options.selectedFile, {
        upload_preset: 'bbaby_posts',
        public_id: post._id.toString(),
        resource_type: 'video',
        quality: 'auto',
      });
      post.mediaInfo.isVideo = options.isVideo;
      post.mediaInfo.video = {
        url: video.secure_url,
      };
      post.mediaInfo.dimension.push(Number(options.height), Number(options.width));
    }
    post.permalink = `/b/${post.community.toLowerCase()}/comments/${post._id}`;
    const url = `https://www.bbabystyle.com${post.permalink}`;
    if (options?.sharePostToTwitter) {
      await shareToTwitter(post, url, user, options.isImage, options.isVideo, options.selectedFile);
    }
    if (options?.sharePostToTG) {
      const chat_id = post.community === 'Italy' ? '@anonynewsitaly' : (communityInfo.language === 'it' ? '@bbabystyle1' : '@bbaby_style');
      await telegram.sendMessage(chat_id, encodeURIComponent(`${post.title} ${url}`));
    }
    communityInfo.number_of_posts += 1;
    user.last_post.push(communityInfo._id);
    user.upVotes.push(post._id);
    post.ups += 1;
    await communityInfo.save();
    await user.save();
    await post.save();
    if (user.role !== 1) {
      await sendLog(`New post created from ${user.username}: ${url}`);
    }
    return post;
  },
  getPosts: async (
    userLang: string,
    limit: number,
    skip: number,
    sort: {
      [key: string]: SortOrder;
    },
    useragent?: Details,
    token?: string,
    options?: {
      community?: string;
      author?: string;
    },
  ) => {
    const _limit = useragent?.isMobile && limit === 15 ? 7 : limit;
    let posts: PostProps[];
    if (options?.community) {
      const filters = { community: coraline.regex.upperLowerCase(options.community) };
      posts = await Post.find(filters).sort(sort).limit(_limit).skip(Number(skip));
    } else if (options?.author) {
      const filters = { author: coraline.regex.upperLowerCase(options.author) };
      posts = await Post.find(filters).sort(sort).limit(_limit).skip(Number(skip));
    } else {
      const communities = await Community.find({ language: userLang || 'en' });
      const selectedCommunities = communities.map((community) => community.name);
      const filters = { community: selectedCommunities };
      posts = await Post.find(filters).sort(sort).limit(_limit).skip(Number(skip));
      if (Number(limit) === 15 && posts.length === 0) {
        posts = await Post.find({}).sort(sort).limit(_limit).skip(Number(skip));
      }
    }
    if (token) {
      const user = await userapis.getUserFromToken(token);
      posts.map((post) => {
        if (user?.upVotes.find((upvote) => upvote.equals(post._id))) post.liked = true;
        if (user?.downVotes.find((downvote) => downvote.equals(post._id))) post.liked = false;
      });
    }
    return posts;
  },
};

export default bbabypost;
