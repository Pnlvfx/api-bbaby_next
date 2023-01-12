import puppeteer from 'puppeteer';
import { catchError, catchErrorWithTelegram } from '../common';
import BBC from '../../models/BBC';
import coraline from '../../coraline/coraline';

const bbcapis = {
  connect: async () => {
    try {
      const browser = await puppeteer.launch({
        args: ['--no-sandbox', '--disabled-setupid-sandbox'],
      });
      const page = await browser.newPage();
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/106.0.0.0 Safari/537.36');
      const url = `https://www.bbc.com`;
      await page.goto(url);
      const links = await page.evaluate(() =>
        Array.from(document.querySelectorAll('a.media__link') as NodeListOf<HTMLAnchorElement>).map((link) => link.href),
      );
      await browser.close();
      return links;
    } catch (err) {
      throw catchError(err);
    }
  },
  getInfo: async (link: string) => {
    try {
      const browser = await puppeteer.launch({
        args: ['--no-sandbox', '--disabled-setupid-sandbox'],
      });
      const page = await browser.newPage();
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/106.0.0.0 Safari/537.36');
      await page.goto(link);
      await page.waitForNetworkIdle();
      page.on('console', async (msg) => {
        try {
          const msgArgs = msg.args();
          for (let i = 0; i < msgArgs.length; ++i) {
            console.log(await msgArgs[i].jsonValue());
          }
        } catch (err) {
          coraline.sendLog('Error while trying to console log with puppeteer');
        }
      });
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
            article,
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
      console.log({info});
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
