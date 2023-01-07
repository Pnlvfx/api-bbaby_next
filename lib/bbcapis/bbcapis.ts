import puppeteer from 'puppeteer';
import { catchError } from '../common';

const bbcapis = {
    connect: async () => {
        try {
            const browser = await puppeteer.launch({
                args: ['--no-sandbox', '--disabled-setupid-sandbox']
            });
            const page = await browser.newPage();
            await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/106.0.0.0 Safari/537.36');
            const url = `https://www.bbc.com`;
            await page.goto(url);
            const links = await page.evaluate(() => 
                Array.from(document.querySelectorAll("a.media__link") as NodeListOf<HTMLAnchorElement>).map((link) => (
                    link.href
                )
            ));
            await browser.close();
            return links;       
        } catch (err) {
            throw catchError(err);
        }
    },
    getInfo: async (link: string) => {
        try {
            const browser = await puppeteer.launch({
                args: ['--no-sandbox', '--disabled-setupid-sandbox']
            })
            const page = await browser.newPage();
            await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/106.0.0.0 Safari/537.36');
            await page.goto(link);
            await page.waitForNetworkIdle();
            page.on('console', async (msg) => {
                const msgArgs = msg.args();
                for (let i = 0; i < msgArgs.length; ++i) {
                console.log(await msgArgs[i].jsonValue());
                }
            });
            const info = await page.evaluate(() => {
                try {
                    const article = (document.body.querySelector('article'));
                    if (!article) throw new Error();
                    const title = (article.querySelector('h1') as HTMLHeadingElement)?.textContent;
                    if (!title) throw new Error();
                    const date = (article.querySelector('time') as HTMLTimeElement).dateTime;
                    const imageContainer = (article.querySelector('picture') as HTMLPictureElement);
                    const image = (imageContainer.querySelector('img') as HTMLImageElement)?.src;
                    const image_source = (imageContainer.querySelector('span.text') as HTMLSpanElement)?.innerText;
                    const description = Array.from(article.querySelectorAll('div.ep2nwvo0') as NodeListOf<HTMLDivElement>).map((descr) => (
                        `${descr.textContent}\n\n`
                    ));
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
                   
                }
            });
            browser.close();
            return info;
        } catch (err) {
            throw catchError(err);
        }
    },
}

export default bbcapis;