import { getLinks, getNews, saveBBCnewstodb } from './hook/bbchooks';
import coraline from '../../coraline/coraline';
import { catchErrorWithTelegram } from '../../config/common';
import openaiapis from '../openaiapis/openaiapis';
import User from '../../models/User';
import bbabyapis from '../bbabyapis/bbabyapis';
import { BBCInfo } from './types/bbctype';
import { IUser } from '../../models/types/user';
import { catchError } from '../../coraline/cor-route/crlerror';

const bbcapis = {
  start: async () => {
    try {
      const { links } = await getLinks();
      let index = 0;
      if (links.length !== 0) {
        const interval = setInterval(async () => {
          try {
            if (index === links.length - 1) {
              clearInterval(interval);
            }
            const link = links[index];
            const news = await getNews(link);
            await saveBBCnewstodb(news);
            index += 1
            setTimeout(async () => {
              try {
                await bbcapis.toPost(news);
              } catch (err) {
                catchErrorWithTelegram(err);
              }
            }, index * 20 * 60 * 1000);
          } catch (err) {
            index += 1
            catchErrorWithTelegram(err);
          }
        }, 25000);
      }
      return true;
    } catch (err) {
      catchErrorWithTelegram(err);
    }
  },
  toPost: async (news: BBCInfo) => {
    try {
      const question = await openaiapis.request(
        `Please explain in a tweet of maximum 300 words, this news, please respect the limit of 300 words or it will be invalid: ${news.title} \n\n ${news.description}`,
      );
      let user: IUser | null = null;
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
      const share = process.env.NODE_ENV === 'production' ? true : false;
      const post = await bbabyapis.post.newPost(user, question, 'News', {
        sharePostToTG: share,
        sharePostToTwitter: share,
      });
      return post;
      //const req = `Please transform in italian this news: ${question}`
      // const translate = await openaiapis.request(req)
      // await bbabyapis.post.newPost(user, translate, 'News')
    } catch (err) {
      throw catchError(err);
    }
  },
};

export default bbcapis;
