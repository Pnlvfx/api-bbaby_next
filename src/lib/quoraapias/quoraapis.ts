import { catchError, catchErrorWithTelegram } from '../../coraline/cor-route/crlerror';
import puppeteer from 'puppeteer';
import puppeteerapis from '../puppeteerapis/puppeteerapis';
import coraline from '../../coraline/coraline';
import Quora from '../../models/Quora';
let browserWSEndpoint: string | undefined;

const quoraapis = {
  useQuora: async (interval: number, scrollSeconds: number) => {
    try {
      await coraline.wait(5000);
      const res = await fetch('http://127.0.0.1:9222/json/version');
      if (!res.ok) throw new Error('Chrome did not start correctly');
      const data = await res.json();
      browserWSEndpoint = data.webSocketDebuggerUrl;
      setInterval(() => quoraapis.getQuoras(scrollSeconds), interval * 60 * 1000);
    } catch (err) {
      throw catchError(err);
    }
  },
  getQuoras: async (scrollSeconds: number) => {
    try {
      const browser = await puppeteer.connect({ browserWSEndpoint });
      const page = await browser.newPage();
      page.setDefaultTimeout(200000);
      page.setDefaultNavigationTimeout(200000);
      await page.goto('https://www.quora.com');
      await page.waitForNetworkIdle();
      await puppeteerapis.scrollFor(page, scrollSeconds, 1, 100);
      const data = await page.evaluate(() => {
        const postsContainers = Array.from(document.querySelectorAll('div.qu-hover--bg--darken'));
        const quoras: ScrapedProps[] = [];
        const errors: unknown[] = [];
        postsContainers.map((postContainer) => {
          try {
            const titleContainer = postContainer.querySelector('div.q-text.qu-dynamicFontSize--regular_title');
            if (!titleContainer || !titleContainer.textContent) throw new Error('Missing title for this quora');
            const url = titleContainer.querySelector('a')?.href;
            if (!url) throw new Error('Missing link for this quora!');
            const upVoteString = postContainer.querySelector(
              'span.q-text.qu-whiteSpace--nowrap.qu-display--inline-flex.qu-alignItems--center.qu-justifyContent--center',
            )?.textContent;
            if (!upVoteString) throw new Error('Missing ups string for this quora!');
            let ups = parseFloat(upVoteString.replace(/[^0-9.]/g, ''));
            if (isNaN(ups)) throw new Error('Error when trying to convert up vote to a number');
            if (upVoteString.includes('K')) {
              ups *= 1000;
            }
            if (upVoteString.includes('M')) {
              ups *= 1000000;
            }
            const descrContainer = postContainer.querySelector('div.q-box.spacing_log_answer_content.puppeteer_test_answer_content');
            const buttonC = descrContainer?.querySelector('div.q-absolute');
            const button = buttonC?.querySelector('div.q-text') as HTMLDivElement;
            if (!button) throw new Error('Missing more button for this quora');
            button.click();
            if (!descrContainer?.textContent) throw new Error('Missing description for this quora');
            const item = {
              ups,
              url,
              title: titleContainer.textContent,
              description: descrContainer.textContent,
            };
            quoras.push(item);
          } catch (err) {
            if (err instanceof Error) {
              errors.push({ message: err.message });
            }
          }
        });
        return { quoras, errors };
      });
      await quoraapis.saveQuoras(data.quoras);
      console.log('quora done', data.errors);
      return data;
    } catch (err) {
      catchErrorWithTelegram(err);
    }
  },
  saveQuoras: async (quoras: ScrapedProps[]) => {
    try {
      await Promise.all(
        quoras.map(async (quora) => {
          try {
            const permalink = coraline.createPermalink(quora.title);
            const exist = await Quora.findOne({ permalink });
            if (exist) return;
            const dbQuora = new Quora({
              ...quora,
              permalink,
            });
            await dbQuora.save();
          } catch (err) {
            console.log(err);
          }
        }),
      );
    } catch (err) {
      throw catchError(err);
    }
  },
};

export default quoraapis;
