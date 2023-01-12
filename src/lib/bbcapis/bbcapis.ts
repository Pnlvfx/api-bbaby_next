import { catchErrorWithTelegram } from '../../config/common';
import BBC from '../../models/BBC';
import { catchError } from '../../coraline/cor-route/crlerror';
import puppeteerapis from '../puppeteerapis/puppeteerapis';
import { Browser, Page } from 'puppeteer';

const bbcapis = {
  getNews: async () => {
    let puppeteer!: {browser: Browser, page: Page}
    try {
      const url = `https://www.bbc.com`;
      puppeteer = await puppeteerapis.connect(url, {headless: false});
      const links = await puppeteer.page.evaluate(() =>
        Array.from(document.querySelectorAll('a.media__link') as NodeListOf<HTMLAnchorElement>).map((link) => link.href),
      );
      const existing = await BBC.find({original_link: links});
      console.log(existing);
      await puppeteer.page.close()
      await puppeteer.browser.close();
      return;
      const news = [];
      let missed: string[] = []
      await Promise.all(
        links.map(async (link, index) => {
          await new Promise((resolve) => {
            setTimeout(resolve, index * 1000)
          })
          try {
            const newspage = await puppeteerapis.goto(puppeteer.browser, link);
            const info = await newspage.evaluate(() => {
              try {
                const article = document.body.querySelector('article');
                if (!article) throw new Error('Missing article');
                const title = (article.querySelector('h1') as HTMLHeadingElement)?.textContent;
                if (!title) throw new Error(`Missing title for ${window.location.href}`);
                const date = (article.querySelector('time') as HTMLTimeElement).dateTime;
                const imageContainer = article.querySelector('picture') as HTMLPictureElement;
                const image = (imageContainer.querySelector('img') as HTMLImageElement)?.src;
                const image_source = (imageContainer.querySelector('span.text') as HTMLSpanElement)?.innerText;
                const description = Array.from(article.querySelectorAll('div.ep2nwvo0') as NodeListOf<HTMLDivElement>).map(
                  (descr) => `${descr.textContent}\n\n`,
                );
                const mylink = title.toLowerCase().replace(/[^a-zA-Z0-9-_]/g, '_');
                const permalink = `/governance/news/${mylink}`;
                const scraped = {
                  title,
                  date,
                  image,
                  image_source,
                  description: description.join(''),
                  permalink,
                };
                return scraped;
              } catch (err) {
                if (err instanceof Error) {
                  console.log(err.message)
                }
                return window.location.href
              }
            });
            await newspage.close();
            if (typeof info === 'string') {
              missed.push(info)
              return
            }
            news.push(info);
          } catch (err) {
            throw catchError(err)
          }
        }),
      );
      puppeteer.browser.close();
      console.log({missed})
      return news;
    } catch (err) {
      throw catchError(err);
    }
  },
  connect: async () => {
    try {
      const url = `https://www.bbc.com`;
      const { browser, page } = await puppeteerapis.connect(url);
      const links = await page.evaluate(() =>
        Array.from(document.querySelectorAll('a.media__link') as NodeListOf<HTMLAnchorElement>).map((link) => link.href),
      );
      browser.close();
      return links;
    } catch (err) {
      throw catchError(err);
    }
  },
  getInfo: async (link: string) => {
    try {
      const { browser, page } = await puppeteerapis.connect(link);
      const info = await page.evaluate(() => {
        try {
          const article = document.body.querySelector('article');
          if (!article) throw new Error('Missing article');
          const title = (article.querySelector('h1') as HTMLHeadingElement)?.textContent;
          if (!title) throw new Error('Missing title');
          const date = (article.querySelector('time') as HTMLTimeElement).dateTime;
          const imageContainer = article.querySelector('picture') as HTMLPictureElement;
          const image = (imageContainer.querySelector('img') as HTMLImageElement)?.src;
          const image_source = (imageContainer.querySelector('span.text') as HTMLSpanElement)?.innerText;
          const description = Array.from(article.querySelectorAll('div.ep2nwvo0') as NodeListOf<HTMLDivElement>).map(
            (descr) => `${descr.textContent}\n\n`,
          );
          const mylink = title.toLowerCase().replace(/[^a-zA-Z0-9-_]/g, '_');
          const permalink = `/governance/news/${mylink}`;
          const scraped = {
            title,
            date,
            image,
            image_source,
            description: description.join(''),
            permalink,
          };
          return scraped;
        } catch (err) {}
      });
      browser.close();
      return info;
    } catch (err) {
      throw catchError(err);
    }
  },
  bot: async () => {
    try {
      let index = 0;
      const links = await bbcapis.connect();
      let final_links: string[] = [];
      await Promise.all(
        links.map(async (link) => {
          try {
            const exist = await BBC.exists({ original_link: link });
            if (exist) return;
            final_links.push(link);
          } catch (err) {}
        }),
      );
      const interval = setInterval(async () => {
        try {
          if (index === final_links.length - 1) {
            console.log('finished');
            clearInterval(interval);
          }
          const link = final_links[index];
          const BBCnews = await bbcapis.getInfo(link);
          if (!BBCnews) {
            console.log('missing news', link);
            return (index += 1);
          }
          const { title, description, image, image_source, date, permalink } = BBCnews;
          const news = new BBC({
            title,
            date,
            description,
            image,
            image_source,
            permalink,
            original_link: link,
          });
          await news.save();
          index += 1;
        } catch (err) {
          clearInterval(interval);
          catchErrorWithTelegram(err);
        }
      }, 25000);
    } catch (err) {
      catchErrorWithTelegram(err);
    }
  },
};

export default bbcapis;
