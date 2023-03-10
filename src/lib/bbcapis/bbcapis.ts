import { getLinks, getNews, saveBBCnewstodb } from './hook/bbchooks';
import { catchErrorWithTelegram } from '../../coraline/cor-route/crlerror';

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
            index += 1;
          } catch (err) {
            index += 1;
            catchErrorWithTelegram('bbcapis.start' + ' ' + err);
          }
        }, 25000);
      }
      return true;
    } catch (err) {
      catchErrorWithTelegram('bbcapis.start' + ' ' + err);
    }
  },
};

export default bbcapis;
