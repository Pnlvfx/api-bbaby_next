import mongoose from 'mongoose';
import config from '../../config/config';
import { catchErrorWithTelegram } from '../../config/common';
import bbcapis from '../bbcapis/bbcapis';
import coraline from '../../coraline/coraline';
import telegramapis from '../telegramapis/telegramapis';
import bbabynews from './route/bbabynews';
import { catchError } from '../../coraline/cor-route/crlerror';
import openaiapis from '../openaiapis/openaiapis';
import userapis from '../userapis/userapis';
import User from '../../models/User';
import bcrypt from 'bcrypt'
import { createActivationToken } from '../../components/user/user-functions/userFunctions';
import sendEMail from '../../components/user/user-functions/sendMail';
import Chance from 'chance'
import Community from '../../models/Community';
import Post from '../../models/Post';
import { IUser } from '../../models/types/user';
import cloudinary from '../../config/cloudinary';
import postapis from '../../components/post/postapis';
import redditapis from '../redditapis/redditapis';

const base_url = config.NODE_ENV === 'production' ? config.SERVER_URL : 'https://290b-91-206-70-33.eu.ngrok.io';

const bbabyapis = {
  initialize: async () => {
    try {
      const db = process.env.NODE_ENV === 'production' ? config.MONGO_URI : 'mongodb://localhost:27017/bbabystyle'; // local;
      await mongoose.connect(db);
      await telegramapis.setWebHook(`${base_url}/bot${config.TELEGRAM_TOKEN}`);
      await telegramapis.setMyCommands([
        { command: 'start', description: 'Start the bot' },
        { command: 'quora', description: 'Quora' },
      ]);
      const timeinterval = coraline.date.hourToms(1);
      setInterval(bbcapis.start, timeinterval);
      //await bbabyapis.answer()
    } catch (err) {
      console.log(err);
      catchErrorWithTelegram(err);
    }
  },
  getLinkPreview: async (url: string) => {
    try {
      const apiUrl = 'https://bbabystyle.uc.r.appspot.com';
      const res = await fetch(`${apiUrl}/v2?url=${url}`);
      const data = await res.json();
      if (!res.ok) throw new Error(`failed to get metadata info from this url: ${url}`);
      return data.metadata as MetadataOutput;
    } catch (error) {
      throw new Error(`failed to get metadata info from this url: ${url}`);
    }
  },
  answer: async () => {
    try {
      // const chance = new Chance()
      // const email = chance.email()
      // const password = coraline.generateRandomId(10);
      // const username = coraline.createPermalink(chance.name() + chance.year({min: 1964, max: 2000}))
      // const user = await bbabyapis.newUser(email, username, password, true);
      // //const user = await User.findOne({is_bot: true});
      // //if (!user) throw new Error('Missing user');
      // const question = await openaiapis.request(`Ask me something about React without writing the response!`);
      // await bbabyapis.newPost(user, question, 'React')
    } catch (err) {
      throw catchError(err);
    }
  },
  newUser: async (email: string, username: string, password: string, isBot?: boolean) => {
    try {
      const {country, countryCode, city, region, lat, lon} = await userapis.getIP();
      if (!username || !email || !password) throw new Error('Please fill in all fields!');
      if (!userapis.validateEmail(email)) throw new Error( 'Not a valid email address!');
      const existingEmail = await User.findOne({ email });
      if (existingEmail) throw new Error('This email already exist!' );
      if (password.length < 8) throw new Error('Password must be at least 8 characters long.');
      const passwordHash = bcrypt.hashSync(password, 10);

      const existingUser = await User.findOne({ username });
      if (existingUser) throw new Error('This username already exist!');

      const user = new User({
        email,
        username,
        password: passwordHash,
        country,
        countryCode,
        city,
        region,
        lat,
        lon,
      });
      if (isBot) {
        user.is_bot = true
      }
      const activation_token = createActivationToken(user);
      const url = `${config.CLIENT_URL}/activation/${activation_token}`;
      sendEMail(email, url, 'Verify your email address');
      await user.save();
      return user;
    } catch (err) {
      throw catchError(err)
    }
  },
  newPost: async(user: IUser, title: string, community: string, options?: PostOptions) => {
    try {
      const communityInfo = await Community.findOne({ name: community });
      if (!communityInfo) throw new Error('Please select a valid community.');
      const exists = await Post.exists({ title, author: user.username, community  });
      if (exists) throw new Error('This post already exist.');
      const post = new Post({
        author: user?.username,
        authorAvatar: user?.avatar,
        title,
        community,
        communityIcon: communityInfo.communityAvatar,
      });
      if (options?.body) {
        post.body = options.body
      }
      if (options?.isImage && options?.selectedFile) {
        const image = await cloudinary.v2.uploader.upload(options.selectedFile, {
          upload_preset: 'bbaby_posts',
          public_id: post._id.toString(),
        });
        const {isImage, height, width} = options
        post.$set({ mediaInfo: { isImage, image: image.secure_url, dimension: [height, width] } });
      }
      if (options?.isVideo && options?.selectedFile) {
        const video = await cloudinary.v2.uploader.upload(options.selectedFile, {
          upload_preset: 'bbaby_posts',
          public_id: post._id.toString(),
          resource_type: 'video',
          quality: 'auto',
        });
        if (!video) throw new Error('Cloudinary error!');
        const {isVideo, height, width} = options
        post.$set({ mediaInfo: { isVideo, video: { url: video.secure_url }, dimension: [height, width] } });
      }
      const url = `https://www.bbabystyle.com/b/${post.community.toLowerCase()}/comments/${post._id}`;
      post.url = url;
      const savedPost = await post.save();
      if (options?.sharePostToTwitter) {
        await postapis.shareToTwitter(savedPost, url, user, communityInfo, options.isImage, options.isVideo, options.selectedFile);
      }
      if (options?.sharePostToTG) {
        const text = `${savedPost.title + ' ' + savedPost.body + ' ' + url}`;
        const chat_id = savedPost.community === 'Italy' ? '@anonynewsitaly' : communityInfo.language === 'it' ? '@bbabystyle1' : '@bbaby_style';
        await telegramapis.sendMessage(chat_id, text);
      }
      communityInfo.$inc('number_of_posts', 1);
      user.last_post = communityInfo._id;
      await user.save();
      await coraline.sendLog(`New post created from ${user.username}`);
      return savedPost;
    } catch (err) {
      throw catchError(err)
    }
  },
  news: bbabynews,
};

export default bbabyapis;
