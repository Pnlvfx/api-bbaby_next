import puppeteer from 'puppeteer';
import config from '../../../config/config';
import fs from 'fs';

export const saveImageToDisk = async(imageUrl:string,index:number) => {
    const {PUBLIC_PATH} = config
    const browser = await puppeteer.launch({
        args: ['--no-sandbox', '--disabled-setupid-sandbox']
    })
    const page = await browser.newPage()
    page.on('response', async (response) => {
        const url = response.url()
            if (response.request().resourceType() === 'image') {
                response.buffer().then((file) => {
                    const imagePath = `${PUBLIC_PATH}/image${index}.webp`
                    const writeStream = fs.createWriteStream(imagePath)
                    writeStream.write(file)
                })
            }
        })
        await page.goto(imageUrl)
        browser.close
}