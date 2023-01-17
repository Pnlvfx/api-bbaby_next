import { Browser } from 'puppeteer';
import { ExternalNews } from '../../../@types/external-news';
import { catchError } from '../../../coraline/cor-route/crlerror';
import BBC from '../../../models/BBC';
import puppeteerapis from '../../puppeteerapis/puppeteerapis';
import { BBCInfo } from '../types/bbctype';
import coraline from '../../../coraline/coraline';
import bbabyapis from '../../bbabyapis/bbabyapis';

const save = async (BBCnews: BBCInfo) => {
  try {
    const exist = await BBC.findOne({ original_link: BBCnews.original_link });
    if (exist) throw new Error('This news already exist');
    const { title, description, image, image_source, date, original_link } = BBCnews;
    const permalink = `/governance/news/${coraline.createPermalink(title)}`;
    const permalinkexist = await BBC.findOne({ permalink });
    if (permalinkexist) throw new Error('This news already exist');
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
  } catch (err) {
    throw catchError(err);
  }
};
export const saveBBCnewstodb = async (BBCnews: BBCInfo | BBCInfo[]) => {
  try {
    let news!: ExternalNews | ExternalNews[];
    if (Array.isArray(BBCnews)) {
      await Promise.all(
        BBCnews.map(async (__news) => {
          try {
            const dbnews = await save(__news);
            Array(news).push(dbnews);
          } catch (err) {
            throw catchError(err);
          }
        }),
      );
    } else {
      news = await save(BBCnews);
    }
    return news;
  } catch (err) {
    throw catchError(err);
  }
};

export const getLinks = async () => {
  try {
    const url = `https://www.bbc.com`;
    const puppeteer = await puppeteerapis.connect(url);
    let links = await puppeteer.page.evaluate(() =>
      Array.from(document.querySelectorAll('a.media__link') as NodeListOf<HTMLAnchorElement>).map((link) => link.href),
    );
    const existing = await BBC.find({ original_link: links });
    const existingLinks = existing.map((_) => _.original_link);
    links = [...links].filter((link) => !existingLinks.includes(link));
    await puppeteer.page.close();
    return { puppeteer, links };
  } catch (err) {
    throw catchError(err);
  }
};

export const getSomeNews = async (browser: Browser, links: string[]) => {
  try {
    const news: BBCInfo[] = [];
    await Promise.all(
      links.map(async (link, index) => {
        await coraline.wait(index * 2000);
        try {
          const newspage = await puppeteerapis.goto(browser, link);
          let info = await newspage.evaluate(() => {
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
              const description = Array.from(article.querySelectorAll('div.ep2nwvo0') as NodeListOf<HTMLDivElement>).map(
                (descr) => `${descr.textContent}\n\n`,
              );
              if (!image || !image_source || description.length < 1)
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
            } catch (err) {
              // there are all the missed news that we can get in another way;
              const article = document.body.querySelector('article');
              if (!article) return window.location.href
              const description = Array.from(article.querySelectorAll('article p') as NodeListOf<HTMLParagraphElement>).map((descr) => (
                `${descr.innerText}\n\n`
              ))
              if (description.length < 1) description.push('Not found');
              let date = (article.querySelector('time') as HTMLTimeElement | null)?.dateTime;
              return [{
                description: description.join(''),
                date
              }]
            }
          });
          await newspage.close();
          if (typeof info === 'string') {
            console.log('still missed', info);
           // still missed
            return;
          } else {
            if (Array.isArray(info)) {
              const metadata = await bbabyapis.getLinkPreview(link);
              info = {
                title: metadata.title,
                image: metadata.image,
                description: info[0].description,
                date: info[0].date,
                original_link: link,
              }
            }
          }
          news.push(info);
        } catch (err) {
          throw catchError(err);
        }
      }),
    );
    return news
  } catch (err) {
    throw catchError(err);
  }
};
