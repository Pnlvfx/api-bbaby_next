import { getLinks, getNews, saveBBCnewstodb } from './hook/bbchooks';
import { catchErrorWithTelegram } from '../../coraline/cor-route/crlerror';

// const toPost = async (news: BBCInfo) => {
//   try {
//     const question = `Please explain in a tweet of maximum 300 words, this news, please respect the limit of 300 words or it will be invalid: ${news.title} \n\n ${news.description}`;
//     const user = await bbabyapis.AIuser();
//     let community = await Community.findOne({ name: 'News' });
//     if (!community) {
//       community = await bbabyapis.community.createCommunity(user, 'News');
//     }
//     await bbabyapis.AIpost(user, question, 'News');
//     //const req = `Please transform in italian this news: ${question}`
//     // const translate = await openaiapis.request(req)
//     // await bbabypost.newPost(user, translate, 'News')
//   } catch (err) {
//     throw catchError(err);
//   }
// };

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
            // if (process.env.NODE_ENV === 'development') {
            //   setTimeout(async () => {
            //     try {
            //       await bbcapis.toPost(news);
            //     } catch (err) {
            //       catchErrorWithTelegram(err);
            //     }
            //   }, index * 20 * 60 * 1000);
            // }
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
