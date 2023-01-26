import { getLinks, getSomeNews, saveBBCnewstodb } from './hook/bbchooks';
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
      const start = performance.now()
      console.log('BBC started')
      const { puppeteer, links } = await getLinks();
      if (links.length !== 0) {
        const news = await getSomeNews(puppeteer.browser, links);
        await puppeteer.browser.close();
        // news.map((_, i) => {
        //   setTimeout(async () => {
        //     try {
        //       await bbcapis.toTweet(_)
        //     } catch (err) {
        //       catchErrorWithTelegram(err)
        //     }
        //   }, i * 20 * 60 * 1000)
        // })
        await saveBBCnewstodb(news);
      }
      coraline.performanceEnd(start, 'BBC')
      //await bbabyapis.news.send();
      return true;
    } catch (err) {
      catchErrorWithTelegram(err);
    }
  },
  toTweet: async (news: BBCInfo) => {
    try {
      const question = await openaiapis.request(`Please explain in a tweet of maximum 300 words, this news, please respect the limit of 300 words or it will be invalid: ${news.title} \n\n ${news.description}`)
      let user: IUser | null = null
      let randomNumber = Math.random();
      if (randomNumber < 0.9) {
        const users = await User.find({is_bot: true});
        if (users.length < 1) {
          user = await bbabyapis.newBot()
        } else {
          user = users[coraline.getRandomInt(users.length -1)]
        }
      } else {
        user = await bbabyapis.newBot()
      }
      const post = await bbabyapis.post.newPost(user, question, 'News')
      return post;
      //const req = `Please transform in italian this news: ${question}`
      // const translate = await openaiapis.request(req)
      // await bbabyapis.post.newPost(user, translate, 'News')
    } catch (err) {
      throw catchError(err)
    }
  }
};

export default bbcapis;
