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
      if (user.role !== 1 && title.toString().length > 300) throw new Error('Title needs to be 300 words maximum.');
      const communityInfo = await Community.findOne({ name: community });
      if (!communityInfo) throw new Error('Please select a valid community.');
      const exists = await Post.exists({ title, author: user.username, community });
      if (exists) throw new Error('This post already exist.');
      const post = new Post({
        author: user?.username,
        authorAvatar: user?.avatar,
        title,
        community,
        communityIcon: communityInfo.image,
      });
      if (options?.body) {
        post.body = options.body;
      }
      if (options?.isImage && options?.selectedFile) {
        const image = await cloudinary.v2.uploader.upload(options.selectedFile, {
          upload_preset: 'bbaby_posts',
          public_id: post._id.toString(),
        });
        const { isImage, height, width } = options;
        post.$set({ mediaInfo: { isImage, image: image.secure_url, dimension: [height, width] } });
      }
      if (options?.isVideo && options?.selectedFile) {
        const video = await cloudinary.v2.uploader.upload(options.selectedFile, {
          upload_preset: 'bbaby_posts',
          public_id: post._id.toString(),
          resource_type: 'video',
          quality: 'auto',
        });
        const { isVideo, height, width } = options;
        post.$set({ mediaInfo: { isVideo, video: { url: video.secure_url }, dimension: [height, width] } });
      }
      const permalink = `/b/${post.community.toLowerCase()}/comments/${post._id}`;
      post.$set({ permalink });
      const url = `${config.CLIENT_URL}${permalink}`;
      if (options?.sharePostToTwitter) {
        await shareToTwitter(post, url, user, communityInfo, options.isImage, options.isVideo, options.selectedFile);
      }
      if (options?.sharePostToTG) {
        const text = `${post.title + ' ' + post.body + ' ' + url}`;
        const chat_id = post.community === 'Italy' ? '@anonynewsitaly' : communityInfo.language === 'it' ? '@bbabystyle1' : '@bbaby_style';
        await telegramapis.sendMessage(chat_id, text);
      }
      communityInfo.$inc('number_of_posts', 1);
      user.last_post = communityInfo._id;
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
