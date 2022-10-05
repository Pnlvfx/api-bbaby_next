import fs from "fs";
import puppeteer from "puppeteer";
import * as TextToImage from 'text-to-image';
import textToSpeech from '@google-cloud/text-to-speech';
import util from 'util';
import {getAudioDurationInSeconds} from 'get-audio-duration';
import  coraline  from "../../../database/coraline";
import { NewsProps } from "../../../@types/news";
import { catchError } from "../../../lib/common";
import Jimp from 'jimp';
import config from '../../../config/config';

export const saveImageToDisk = async(imageUrl: string, index: number) => {
    const browser = await puppeteer.launch({args: ['--no-sandbox', '--disabled-setupid-sandbox'] })
    const page = await browser.newPage()
    const path = coraline.use('youtube')
    page.on('response', async (response) => {
        const url = response.url()
        const type = response.request().resourceType()
            if (type === 'document') {
                response.buffer().then((file) => {
                    const imagePath = `${path}/image${index}.webp`
                    const writeStream = fs.createWriteStream(imagePath)
                    writeStream.write(file)
                })
            }
        })
        await page.goto(imageUrl)
        browser.close;
}

const getFormat = (news: NewsProps) =>  {
    if (!news.mediaInfo.image) throw new Error('Missing image!');
    const split = news.mediaInfo.image.split('?')[0].split('.');
    const format = split[split.length - 1]
    return format;
};

const overlayImage = async (overlayImage: string, backgroundImage: string, destination: string) => {
    try {
        let overlay = await Jimp.read(overlayImage);
        const image = await Jimp.read(backgroundImage);
        image.composite(overlay, 0, 0, {
            mode: Jimp.BLEND_SOURCE_OVER,
            opacityDest: 1,
            opacitySource: 1
        });
        const finalImage = await image.writeAsync(destination);
        return destination
    } catch (err) {
        throw catchError(err);
    }
}

export const _createImage = async (input: string, news: NewsProps, textColor: string, width: number, height: number, fontSize: number, format: string, index: number) => {
    try {
        const bgColor = 'rgba(0,0,0,0';
        const textData = await TextToImage.generate(input, {
            maxWidth: width,
            bgColor,
            textColor,
            fontFamily: 'Helvetica',
            customHeight: height,
            fontSize,
            lineHeight: fontSize,
            textAlign: 'center',
            verticalAlign: 'center'
        });
        const data = textData.replace(/^data:image\/\w+;base64,/, '');
        const imageOverlay = Buffer.from(data, 'base64');
        const youtubePath = coraline.use('youtube');
        const overlayPath = `${youtubePath}/overlay${index}.png`;
        const writeFile = util.promisify(fs.writeFile)
        await writeFile(overlayPath, imageOverlay, 'binary')
        const path = coraline.use('images');
        const format = getFormat(news);
        const bgImage = `${path}/news/${news._id.toString()}_1920x1080.${format}`;
        const imagePath = `${youtubePath}/image${index}.png`;
        const filename = await overlayImage(overlayPath, bgImage, imagePath);
        const base_url = config.SERVER_URL;
        const url = `${base_url}/gov/youtube/image${index}.png`;
        return {url, filename};
    } catch (err) {
        throw catchError(err);
    }
}

export const createAudio = async (input: string, index: number, audio: Array<string>) => {
    try {
        const client = new textToSpeech.TextToSpeechClient();
        const [response] = await client.synthesizeSpeech({
            input: {text: input},
            voice: {languageCode: 'it', ssmlGender: 'MALE'},
            audioConfig: {audioEncoding: 'MP3'}
        });
        if (!response.audioContent) throw new Error("Something went wrong. Don't panic. Try again.")
        const youtubePath = coraline.use('youtube')
        const audioPath = `${youtubePath}/audio${index}.mp3`
        const writeFile = util.promisify(fs.writeFile)
        await writeFile(audioPath, response.audioContent, 'binary')
        const audioDuration = await getAudioDurationInSeconds(audioPath)
        audio.push(audioPath);
        return audioDuration;
    } catch (err) {
        throw catchError(err);
    }
}

