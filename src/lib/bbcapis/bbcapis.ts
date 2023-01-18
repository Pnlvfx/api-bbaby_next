import { catchError } from '../../coraline/cor-route/crlerror';
import { getLinks, getSomeNews, saveBBCnewstodb } from './hook/bbchooks';
import coraline from '../../coraline/coraline';

const bbcapis = {
  start: async () => {
    try {
      const start = performance.now();
      const { puppeteer, links } = await getLinks();
      if (links.length !== 0) {
        console.log('scraping')
        const news = await getSomeNews(puppeteer.browser, links);
        puppeteer.browser.close();
        await saveBBCnewstodb(news);
        console.log('end scraping')
      }
      //await bbabyapis.news.send();
      coraline.performanceEnd(start, 'getting new BBCnews');
      return true;
    } catch (err) {
      throw catchError(err);
    }
  },
};

export default bbcapis;
