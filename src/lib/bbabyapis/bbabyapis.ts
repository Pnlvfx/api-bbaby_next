import config from '../../config/config';
import mongoose from 'mongoose';
import coraline from '../../coraline/coraline';
import { catchError, catchErrorWithTelegram } from '../../coraline/cor-route/crlerror';
import userapis from '../userapis/userapis';
import bbabypost from './route/bbabypost/bbabypost';
import { Chance } from 'chance';
import User from '../../models/User';
import openaiapis from '../openaiapis/openaiapis';
import { IUser } from '../../models/types/user';
import Post from '../../models/Post';
import bbabycommunity from './route/bbabycommunity/bbabycommunity';
import { answer } from './hooks/answer';
import { useEarthquakeAI } from '../earthquakeapis/earthquakeAI';
import { check, useTelegram } from './hooks/hooks';
import { useTwitterNotifications } from './hooks/twitterNotification';
import puppeteer from 'puppeteer';
const bbabyapis = {
  vivaio: async () => {
    ///TEST

    ///DOWNLOAD
    const path = coraline.useStatic('/images/altre-piante');
    const allUliviImages = `${path}/altre-piante.json`;
    const imgs = await coraline.readJSON(allUliviImages);
    let index = 0;

    const download = async () => {
      try {
        if (index <= imgs.length - 1) {
          await coraline.media.getMediaFromUrl(imgs[index], `altre-piante/${index}`, 'images');
          index += 1;
          download();
        } else {
          console.log('finished');
        }
      } catch (err) {
        console.log(err);
      }
    };

    download();

    return;

    ////SCRAPE

    const base_url = 'http://vivaibonomo.it/b33_16_le-nostre-piante+altre-piante.html';
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(base_url);
    const images = await page.evaluate(async () => {
      const containers = Array.from(document.querySelectorAll('div.grid3column') as NodeListOf<HTMLDivElement>);
      const scraped: string[] = [];
      await Promise.all(
        containers.map((c) => {
          const image = c.querySelector('img[title]') as HTMLImageElement;
          if (!image) return;
          let clear = image.style.backgroundImage.replace('url(".', '').replace('")', '');
          const split = clear.split('/_thumbs');
          clear = split.join('').toLowerCase();
          scraped.push('http://vivaibonomo.it' + clear);
        }),
      );
      return scraped;
    });
    console.log(images);
    await coraline.saveFile(allUliviImages, images);
    //
  },
  initialize: async () => {
    try {
      check();
      const db = config.NODE_ENV === 'production' ? config.MONGO_URI : 'mongodb://localhost:27017/bbabystyle';
      await mongoose.connect(db);
      mongoose.set('strictQuery', true);

      if (config.NODE_ENV === 'development') return;
      await useTelegram();
      useTwitterNotifications(30);
      useEarthquakeAI(5);
    } catch (err) {
      catchErrorWithTelegram('bbabyapis.initialize' + ' ' + err);
    }
  },
  getLinkPreview: async (url: string) => {
    try {
      const res = await fetch(`https://bbabystyle.uc.r.appspot.com/v2?url=${url}`);
      const data = await res.json();
      if (!res.ok) throw new Error(`failed to get metadata info from this url: ${url}`);
      return data.metadata as MetadataOutput;
    } catch (error) {
      throw new Error(`failed to get metadata info from this url: ${url}`);
    }
  },
  newBot: async (username?: string) => {
    try {
      if (username) {
        const regex = coraline.regex.upperLowerCase(username);
        const exist = await User.findOne({ username: regex });
        if (exist) return exist;
        const email = new Chance().email();
        const password = coraline.generateRandomId(10);
        const _username = coraline.createPermalink(username);
        const user = await userapis.newUser(email, _username, password);
        user.is_bot = true;
        await user.save();
        return user;
      } else {
        const chance = new Chance();
        const email = chance.email();
        const password = coraline.generateRandomId(10);
        const _username = coraline.createPermalink(chance.name() + coraline.year({ min: 1964, max: 2000 }));
        const ipInfo = await userapis.getIP();
        const user = await userapis.newUser(email, _username, password, ipInfo);
        user.is_bot = true;
        await user.save();
        return user;
      }
    } catch (err) {
      throw catchError(err);
    }
  },
  AIuser: async () => {
    try {
      let user: IUser;
      const randomNumber = Math.random();
      if (randomNumber < 0.9) {
        const users = await User.find({ is_bot: true });
        if (users.length < 1) {
          user = await bbabyapis.newBot();
        } else {
          user = users[coraline.getRandomInt(users.length - 1)];
        }
      } else {
        user = await bbabyapis.newBot();
      }
      return user;
    } catch (err) {
      throw catchError(err);
    }
  },
  AIpost: async (user: IUser, prompt: string, community: string, share = false) => {
    try {
      const title = await openaiapis.request(prompt, {
        temperature: Math.random(),
      });
      const exist = await Post.findOne({ title, community });
      if (exist) {
        if (!prompt.match(`and don't use this question or similar:`)) {
          prompt += ` and don't use this question or similar:`;
        }
        prompt = `${prompt} \n ${title},`;
        await answer(prompt);
        return;
      }
      const post = await bbabypost.newPost(user, title, community, {
        sharePostToTG: share,
        sharePostToTwitter: share,
      });
      return post;
    } catch (err) {
      throw catchError(err);
    }
  },
  AIrequest: async (request: string) => {
    try {
      let res: string;
      if (process.env.NODE_ENV === 'development') {
        try {
          res = await openaiapis.myrequest(request);
        } catch (err) {
          res = await openaiapis.request(request);
        }
      } else {
        res = await openaiapis.request(request);
      }
      return res;
    } catch (err) {
      throw catchError(err);
    }
  },
  community: bbabycommunity,
};

export default bbabyapis;
