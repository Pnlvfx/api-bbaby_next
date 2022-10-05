import puppeteer from 'puppeteer';
import { catchError } from './common';
const bbcapis = {
    connect: async () => {
        try {
            const browser = await puppeteer.launch();
            const page = await browser.newPage();
            const url = `https://www.bbc.com`
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
    getDescription: async (link: string) => {
        try {
            const browser = await puppeteer.launch({
                args: ['--no-sandbox', '--disabled-setupid-sandbox']
            })
            const page = await browser.newPage();
            await page.goto(link);
            const description = await page.evaluate(() => 
                Array.from(document.querySelectorAll('article p') as NodeListOf<HTMLParagraphElement>).map((descr) => (
                    `${descr.innerText}\n\n`
                ))
            )
            await browser.close()
            return description;
        } catch (err) {
            throw catchError(err);
        }
    }
}

export default bbcapis;