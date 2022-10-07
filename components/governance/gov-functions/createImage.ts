import fs from "fs";
import * as TextToImage from 'text-to-image';
import util from 'util';
import {getAudioDurationInSeconds} from 'get-audio-duration';
import  coraline  from "../../../database/coraline";
import { NewsProps } from "../../../@types/news";
import { catchError } from "../../../lib/common";
import Jimp from 'jimp';
import config from '../../../config/config';
import googleapis from "../../../lib/googleapis/googleapis";

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
        const url = `https://texttospeech.googleapis.com/v1/text:synthesize`;
        const path = coraline.use('token');
            const filename = `${path}/texttospeech_token.json`;
            let tokens = await coraline.readJSON(filename);
            if (!tokens) {
                tokens = await googleapis.serviceAccount.getAccessToken('text_to_speech');
            }
        const body = JSON.stringify({
            input: {
                text: input
            },
            voice: {
                languageCode: 'it',
                ssmlGender: 'MALE'
            },
            audioConfig: {
                audioEncoding: 'MP3'
            }
        });
        
        const res = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                "Accept": "application/json",
                Authorization: `Bearer ${tokens.access_token}`
            },
            body
        });
        const data = await res.json();
        if (!res.ok) {
            throw new Error(data?.msg);
        } else {
            const youtubePath = coraline.use('youtube');
            const audioPath = `${youtubePath}/audio${index}.mp3`;
            const buffer = Buffer.from(data.audioContent, 'base64');
            const writeFile = util.promisify(fs.writeFile);
            await writeFile(audioPath, buffer, 'binary');
            const audioDuration = await getAudioDurationInSeconds(audioPath);
            audio.push(audioPath);
            return audioDuration;
        }
    } catch (err) {
        throw catchError(err);
    }
}

