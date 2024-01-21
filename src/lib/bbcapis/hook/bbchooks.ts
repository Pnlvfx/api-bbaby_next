import type { ExternalNews } from '../../../@types/external-news';
import BBC from '../../../models/bbc';
import { BBCInfo } from '../types/bbctype';
import bbabyapis from '../../bbabyapis/bbabyapis';
import coraline from 'coraline';

const save = async (BBCnews: BBCInfo) => {
  const exist = await BBC.findOne({ original_link: BBCnews.original_link });
  if (exist) return exist;
  const { title, description, image, image_source, date, original_link } = BBCnews;
  const permalink = `/governance/news/${coraline.createPermalink(title)}`;
  const permalinkexist = await BBC.findOne({ permalink });
  if (permalinkexist) return permalinkexist;
  const news = new BBC({
    title,
    date,
    description,
    image,
    image_source,
    permalink,
    original_link,
  });
  await news.save();
  return news;
};
export const saveBBCnewstodb = async (BBCnews: BBCInfo | BBCInfo[]) => {
  let news!: ExternalNews | ExternalNews[];
  if (Array.isArray(BBCnews)) {
    await Promise.all(
      BBCnews.map(async (__news) => {
        const dbnews = await save(__news);
        new Array(news).push(dbnews);
      }),
    );
  } else {
    news = await save(BBCnews);
  }
  return news;
};

export const getLinks = async () => {
  const url = `https://www.bbc.com`;
  const { browser, page } = await puppeteerapis.connect(url);
  let links = await page.evaluate(() => [...(document.querySelectorAll('a.media__link') as NodeListOf<HTMLAnchorElement>)].map((link) => link.href));
  links = [...new Set(links)]; // remove duplicates
  const existing = await BBC.find({ original_link: links });
  const existingLinks = new Set(existing.map((_) => _.original_link));
  links = [...links].filter((link) => !existingLinks.has(link));
  await browser.close();
  return { links };
};

export const getNews = async (link: string) => {
  let news: BBCInfo;
  try {
    const { browser, page } = await puppeteerapis.connect(link);
    let info = await page.evaluate(() => {
      try {
        const article = document.body.querySelector('article');
        if (!article) throw new Error('Missing article');
        const title = (article.querySelector('h1') as HTMLHeadingElement)?.textContent;
        if (!title) throw new Error(`Missing title for ${window.location.href}`);
        const date = (article.querySelector('time') as HTMLTimeElement).dateTime;
        const imageContainer = article.querySelector('picture') as HTMLPictureElement;
        if (!imageContainer) throw new Error(`Missing image for ${window.location.href}`);
        const image = (imageContainer.querySelector('img') as HTMLImageElement)?.src;
        const image_source = (imageContainer.querySelector('span.text') as HTMLSpanElement)?.innerText;
        const description = [...(article.querySelectorAll('div.ep2nwvo0') as NodeListOf<HTMLDivElement>)].map((descr) => `${descr.textContent}\n\n`);
        if (!image || !image_source || description.length === 0)
          throw new Error(`Missing required information for this news: ${window.location.href}`);
        const scraped: BBCInfo = {
          title,
          date,
          image,
          image_source,
          description: description.join(''),
          original_link: window.location.href,
        };
        return scraped;
      } catch {
        // there are all the missed news that we can get in another way;
        const article = document.body.querySelector('article');
        if (!article) return window.location.href;
        const description = [...(article.querySelectorAll('article p') as NodeListOf<HTMLParagraphElement>)].map((descr) => `${descr.innerText}\n\n`);
        if (description.length === 0) description.push('Not found');
        const date = (article.querySelector('time') as HTMLTimeElement | null)?.dateTime;
        return [
          {
            description: description.join(''),
            date,
          },
        ];
      }
    });
    await browser.close();
    if (typeof info === 'string') {
      await coraline.sendLog(info);
      throw new Error('bbc news missed');
    } else if (Array.isArray(info)) {
      const metadata = await bbabyapis.getLinkPreview(link);
      info = {
        title: metadata.title,
        image: metadata.image,
        description: info[0].description,
        date: info[0].date,
        original_link: link,
      };
    }
    news = info;
  } catch (err) {
    throw catchError(err);
  }
  return news;
};
