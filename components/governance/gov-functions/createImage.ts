import fs from "fs"
import express from 'express'
import puppeteer from "puppeteer"
import * as TextToImage from 'text-to-image'
import cloudinary from "../../../lib/cloudinary"
import textToSpeech from '@google-cloud/text-to-speech'
import util from 'util'
import {getAudioDurationInSeconds} from 'get-audio-duration'
import  coraline  from "../../../database/coraline"
import { NewsProps } from "../../../@types/news"

export const saveImageToDisk = async(imageUrl: string, index: number) => {
    const browser = await puppeteer.launch({args: ['--no-sandbox', '--disabled-setupid-sandbox'] })
    const page = await browser.newPage()
    const path = await coraline.use('youtube')
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

export const _createImage = async(input: string,news: NewsProps,textColor: string, width: number, height: number, fontSize: number, format: string,res: express.Response) => {
    const bgColor = 'rgba(0,0,0,0'
        const data = await TextToImage.generate(`${input}`, {
            maxWidth: width,
            bgColor,
            textColor,
            fontFamily: 'Helvetica',
            customHeight: height,
            fontSize,
            lineHeight: 48,
            textAlign: 'center',
            verticalAlign: 'center'
        })
        if (!data) return res.status(500).json({msg: "Cannot generate image with this settings"})
            const imageWText = await cloudinary.v2.uploader.upload(data, {
                upload_preset: 'bbaby_governance'
            })
            if (!imageWText) {
                return res.status(500).json({msg: 'Something went wrong when trying to parse the text on the image'})
            }
            const {public_id} = imageWText
            const new_public_id = public_id.replace('/', ':')
            const updatedImage = cloudinary.v2.image(`news/${news._id}.${format}`, {overlay: new_public_id})
            if (!updatedImage) {
                return res.status(500).json({msg: 'Final image: Something went wrong when trying to add the image with the text on the image'})
            }
            const finalImage = updatedImage.replace('<img src=','').replace('/>','').replace('http', 'https').replaceAll("'", "")
            return finalImage;
}

export const createAudio = async(input:string,index:number,audio:Array<any>,res:express.Response) => {
    const client = new textToSpeech.TextToSpeechClient()
    const [response] = await client.synthesizeSpeech({
        input: {text: input},
        voice: {languageCode: 'it', ssmlGender: 'MALE'},
        audioConfig: {audioEncoding: 'MP3'}
    });
    if (!response.audioContent) return res.status(500).json({msg: "Something went wrong. Don't panic. Try again."})
    const youtubePath = await coraline.use('youtube')
    const audioPath = `${youtubePath}/audio${index}.mp3`
    const writeFile = util.promisify(fs.writeFile)
    await writeFile(audioPath,response.audioContent, 'binary')
    const audioDuration = await getAudioDurationInSeconds(audioPath)
    audio.push(audioPath);
    return audioDuration;
}

