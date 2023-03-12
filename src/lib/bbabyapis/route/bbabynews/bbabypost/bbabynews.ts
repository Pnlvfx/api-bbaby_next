import { ExternalNews } from '../../../../../@types/external-news';
import { apiconfig } from '../../../../../config/APIconfig';
import { catchError } from '../../../../../coraline/cor-route/crlerror';
import coraline from '../../../../../coraline/coraline';
import BBC from '../../../../../models/BBC';
import googleapis from '../../../../googleapis/googleapis';
import telegramapis from '../../../../telegramapis/telegramapis';
const telegram = telegramapis(process.env.TELEGRAM_TOKEN);

const bbabynews = {
  getShortestNews: async () => {
    try {
      const startOfDay = coraline.date.startOfDay(new Date());
      const endOfDay = coraline.date.endOfDay(new Date());
      const news = await BBC.find({
        $and: [
          { description: { $ne: 'Not found' } },
          { notified: { $ne: true } },
          { date: { $ne: undefined } },
          { date: { $gte: startOfDay.toISOString(), $lt: endOfDay.toISOString() } },
        ],
      });
      const filter: ExternalNews[] = [];
      news.map((article) => {
        if (article.description.length < 400 || article.description.length > 3300) return;
        filter.push(article);
      });
      if (filter.length === 0) {
        await telegram.sendMessage(apiconfig.telegram.my_chat_id, 'No news to get!');
        return;
      } else {
        const short = filter.sort((a, b) => a.description.length - b.description.length)[0];
        return short;
      }
    } catch (err) {
      throw catchError(err);
    }
  },
  send: async () => {
    try {
      const short = await bbabynews.getShortestNews();
      if (!short) return;
      const date = coraline.date.toYYMMDD(short.date as string);
      const translated = await googleapis.translate(`${short.title} \n\n${short.description}`, 'en', 'it');
      const text = `${date} \n${translated}`;
      const tgPhoto = await telegram.sendPhoto(apiconfig.telegram.my_chat_id, short.image, {
        protect_content: true,
      });
      await telegram.sendMessage(apiconfig.telegram.my_chat_id, text, {
        reply_to_message_id: tgPhoto.result.message_id,
        reply_markup: {
          inline_keyboard: [
            [
              { text: 'Edit', callback_data: 'edit' },
              { text: 'Create', callback_data: 'create' },
            ],
          ],
        },
      });
      short.notified = true;
      await short.save();
    } catch (err) {
      throw catchError(err);
    }
  },
};

export default bbabynews;
