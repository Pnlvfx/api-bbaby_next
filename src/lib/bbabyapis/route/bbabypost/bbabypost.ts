import cloudinary from '../../../../config/cloudinary';
import { catchError } from '../../../../coraline/cor-route/crlerror';
import coraline from '../../../../coraline/coraline';
import Community from '../../../../models/Community';
import Post from '../../../../models/Post';
import { IUser } from '../../../../models/types/user';
import telegramapis from '../../../telegramapis/telegramapis';
import { shareToTwitter } from './createPostHooks';
import config from '../../../../config/config';

const bbabypost = {
  newPost: async (user: IUser, title: string, community: string, options?: PostOptions) => {
    try {
      if (user.role !== 1 && title.length > 300) throw new Error('Title needs to be 300 words maximum.');
      if (!title || title.length < 1) throw new Error('Title is too short, try something different!');
      const communityInfo = await Community.findOne({ name: coraline.mongo.regexUpperLowerCase(community) });
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
        post.mediaInfo.dimension.push(...[Number(options.height), Number(options.width)]);
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
        post.mediaInfo.dimension.push(...[Number(options.height), Number(options.width)]);
      }
      post.permalink = `/b/${post.community.toLowerCase()}/comments/${post._id}`;
      const url = `${config.CLIENT_URL}${post.permalink}`;
      if (options?.sharePostToTwitter) {
        await shareToTwitter(post, url, user, communityInfo, options.isImage, options.isVideo, options.selectedFile);
      }
      if (options?.sharePostToTG) {
        const chat_id = post.community === 'Italy' ? '@anonynewsitaly' : communityInfo.language === 'it' ? '@bbabystyle1' : '@bbaby_style';
        await telegramapis(process.env.TELEGRAM_TOKEN).sendMessage(chat_id, `${post.title} ${url}`);
      }
      communityInfo.number_of_posts += 1;
      user.last_post.push(communityInfo._id);
      user.upVotes.push(post._id);
      post.ups += 1;
      await communityInfo.save();
      await user.save();
      await post.save();
      await coraline.sendLog(`New post created from ${user.username}: ${url}`);
      return post;
    } catch (err) {
      throw catchError(err);
    }
  },
};

export default bbabypost;
