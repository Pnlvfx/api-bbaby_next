import { sendLog } from '../telegram';
import { getLinks, getNews, saveBBCnewstodb } from './hook/bbchooks';

const bbcapis = {
  start: async () => {
    const { links } = await getLinks();
    let index = 0;
    if (links.length > 0) {
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
          sendLog('bbcapis.start' + ' ' + err);
        }
      }, 25_000);
    }
    return true;
  },
};

export default bbcapis;
