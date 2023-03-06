import { catchError } from '../../coraline/cor-route/crlerror';
import puppeteer from 'puppeteer';
import puppeteerapis from '../puppeteerapis/puppeteerapis';
import { startChrome } from './hooks/qhooks';
import coraline from '../../coraline/coraline';
let browserWSEndpoint: string | undefined;

const quoraapis = {
  getQuoras: async () => {
    try {
      const browser = await puppeteer.connect({ browserWSEndpoint });
      const page = await browser.newPage();
      await page.goto('https://www.quora.com');
      page.on('console', async (msg) => {
        try {
          const msgArgs = msg.args();
          for (let i = 0; i < msgArgs.length; ++i) {
            console.log(await msgArgs[i].jsonValue());
          }
        } catch (err) {
          console.log('Error when console.log on puppeteer');
        }
      });
      await page.waitForNetworkIdle();
      await puppeteerapis.scrollFor(page, 10, 1, 100);
      const data = await page.evaluate(() => {
        const postsContainers = Array.from(document.querySelectorAll('div.qu-hover--bg--darken'));
        const quoras: QuoraProps[] = [];
        const errors: unknown[] = [];
        postsContainers.map((postContainer) => {
          try {
            const titleContainer = postContainer.querySelector('div.q-text.qu-dynamicFontSize--regular_title');
            if (!titleContainer || !titleContainer.textContent) throw new Error('Missing title for this quora');
            const url = titleContainer.querySelector('a')?.href;
            if (!url) throw new Error('Missing link for this quora!');
            const upVote = postContainer.querySelector(
              'span.q-text.qu-whiteSpace--nowrap.qu-display--inline-flex.qu-alignItems--center.qu-justifyContent--center',
            )?.textContent;
            if (!upVote) throw new Error('Missing upvotes for this quora');
            const descrContainer = postContainer.querySelector('div.q-box.spacing_log_answer_content.puppeteer_test_answer_content');
            if (!descrContainer || !descrContainer.textContent) throw new Error('Missing description for this quora');
            const buttonC = descrContainer.querySelector('div.q-absolute');
            const button = buttonC?.querySelector('div.q-text') as HTMLDivElement;
            if (!button) throw new Error('Missing more button for this quora');
            button.click();
            const description = descrContainer.textContent;
            const item = {
              upVote,
              url,
              title: titleContainer.textContent,
              description,
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
      return data;
    } catch (err) {
      throw catchError(err);
    }
  },
  useQuora: async () => {
    try {
      startChrome();
      await coraline.wait(5000);
      const res = await fetch('http://127.0.0.1:9222/json/version');
      if (!res.ok) throw new Error('Chrome did not start correctly');
      const data = await res.json();
      browserWSEndpoint = data.webSocketDebuggerUrl;
    } catch (err) {
      throw catchError(err);
    }
  },
};

export default quoraapis;
