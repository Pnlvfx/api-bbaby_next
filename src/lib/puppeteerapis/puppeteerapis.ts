import { Browser, Page, PuppeteerLaunchOptions } from 'puppeteer';
import puppeteer from 'puppeteer';
import { catchError } from '../../coraline/cor-route/crlerror';
import os from 'os';

const puppeteerapis = {
  connect: async (url: string, options?: PuppeteerLaunchOptions) => {
    try {
      /* prettier-ignore */
      const browser = await puppeteer.launch({
        ...options,
        args: [
          "--no-sandbox",
          "--disable-setuid-sandbox",
          "--disable-dev-shm-usage",
          "--disable-accelerated-2d-canvas",
          "--disable-gpu",
          "--window-size=1920x1080"
        ],
      });
      /* prettier-ignore */
      const page = await browser.newPage();
      await page.setViewport({
        width: 1920,
        height: 1080,
      });
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/106.0.0.0 Safari/537.36');
      page.setDefaultTimeout(100000);
      page.setDefaultNavigationTimeout(150000);
      await page.goto(url);
      await page.waitForNetworkIdle();
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
      return { browser, page };
    } catch (err) {
      throw catchError(err);
    }
  },
  goto: async (browser: Browser, url: string) => {
    try {
      const page = await browser.newPage();
      await page.setViewport({
        width: 1920,
        height: 1080,
      });
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/106.0.0.0 Safari/537.36');
      page.setDefaultTimeout(100000);
      page.setDefaultNavigationTimeout(150000);
      await page.goto(url);
      await page.waitForNetworkIdle();
      page.on('console', async (msg) => {
        try {
          const msgArgs = msg.args();
          for (let i = 0; i < msgArgs.length; ++i) {
            console.log(await msgArgs[i].jsonValue());
          }
        } catch (err) {
          console.log('Error when console log on puppeteer');
        }
      });
      return page;
    } catch (err) {
      throw catchError(err);
    }
  },
  scrollToEnd: async (page: Page) => {
    try {
      await page.evaluate(async () => {
        await new Promise((resolve, reject) => {
          let totalHeight = 0;
          const distance = 100;
          var timer = setInterval(() => {
            var scrollHeight = document.body.scrollHeight;
            window.scrollBy(0, distance);
            totalHeight += distance;

            if (totalHeight >= scrollHeight) {
              clearInterval(timer);
              return resolve(true);
            }
          }, 100);
        });
      });
    } catch (err) {
      throw catchError(err);
    }
  },
  performanceWrapper: async (callback: () => Promise<any>) => {
    try {
      const maxCPUUsage = os.cpus().length * 100 * 1000;
      const maxMem = os.totalmem();
      const startCPU = process.cpuUsage();
      const startMem = process.memoryUsage();
      const startTime = Date.now();

      // call your custom function here
      const data = await callback();

      const endCPU = process.cpuUsage();
      const endMem = process.memoryUsage();
      const endTime = Date.now();

      const usedCPU = endCPU.user - startCPU.user + endCPU.system - startCPU.system;
      const usedMem = endMem.heapUsed;

      if (usedCPU / maxCPUUsage > 0.9) {
        console.log('CPU usage is high, close to the limit');
      }
      console.log('CPU Time: ' + usedCPU + ' microseconds');

      if (usedMem / maxMem > 0.9) {
        console.log('Memory usage is high, close to the limit');
      }
      console.log('Heap used: ' + usedMem / (1024 * 1024) + ' MB');

      console.log(`Time taken: ${endTime - startTime}ms`);
      return data;
    } catch (err) {
      throw catchError(err);
    }
  },
};

export default puppeteerapis;
