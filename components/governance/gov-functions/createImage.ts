import fs from "fs"
import express from 'express'
import puppeteer from "puppeteer"
import config from "../../../config/config"
import * as TextToImage from 'text-to-image'
import cloudinary from "../../../lib/cloudinary"
import textToSpeech from '@google-cloud/text-to-speech'
import util from 'util'
import {getAudioDurationInSeconds} from 'get-audio-duration'

const {PUBLIC_PATH} = config

export const makeDir = async(path:string,res:express.Response) => {
    try {
        fs.mkdirSync(path)
    } catch (err:any) {
        if (err.code != 'EEXIST') {
            return res.status(500).json({msg: "Something went wrong when try to create the path"})
        }
    }
}

export const saveImageToDisk = async(imageUrl:any,index:number) => {
    const browser = await puppeteer.launch({
        args: ['--no-sandbox', '--disabled-setupid-sandbox']
    })
    const page = await browser.newPage()
    page.on('response', async (response) => {
        const url = response.url()
            if (response.request().resourceType() === 'document') {
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

export const _createImage = async(input:string,post:any,textColor:string,width:number,height:number,fontSize:number,format:string,res:express.Response) => {
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
            const updatedImage = cloudinary.v2.image(`${post.imageId}.${format}`, {overlay: new_public_id})
            if (!updatedImage) {
                return res.status(500).json({msg: 'Final image: Something went wrong when trying to add the image with the text on the image'})
            }
            const cleanImage = updatedImage.replace('<img src=','')
            const cleanImage2 = cleanImage.replace('/>','')
            const cleanImage3 = cleanImage2.replace('http', 'https')
            const finalImage = cleanImage3.replaceAll("'", "")
            return finalImage
}

export const createAudio = async(input:string,index:number,audio:Array<any>) => {
    const client = new textToSpeech.TextToSpeechClient()
    const [response]:any = await client.synthesizeSpeech({
        input: {text:input},
        voice: {languageCode: 'it', ssmlGender: 'MALE'},
        audioConfig: {audioEncoding: 'MP3'}
    });
    const audioPath = `${PUBLIC_PATH}/audio${index}.mp3`
    const writeFile = util.promisify(fs.writeFile)
    await writeFile(audioPath,response.audioContent, 'binary')
    const audioDuration = await getAudioDurationInSeconds(audioPath)
    audio.push(audioPath)
    return audioDuration
}

