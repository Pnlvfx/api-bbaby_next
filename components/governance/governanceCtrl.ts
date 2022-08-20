import type {Request, Response} from 'express';
import config from '../../config/config';
import {createAudio, makeDir,saveImageToDisk,_createImage} from './gov-functions/createImage';
import cloudinary from '../../lib/cloudinary';
import videoshow from 'videoshow';
import {TranslationServiceClient} from '@google-cloud/translate';
import audioconcat from 'audioconcat';
import { getUserFromToken } from '../user/user-functions/userFunctions';
import puppeteer from 'puppeteer';
import { createClient } from 'pexels';
import News from '../../models/News';

const {PUBLIC_PATH} = config;

const governanceCtrl = {
    createImage: async (req: Request, res: Response) => {
        const {textColor,fontSize,description,newsId,format} = req.body;
        if (description.length <= 1) return res.status(500).json({msg: "Please select at least 2 paragraph."})
        const news = await News.findById(newsId);
        description.reverse()
        description.push(news?.title)
        description.reverse()
        let images:any = []
        let localImages:any = []
        let audio:any = []
        if (!news || !news.mediaInfo.width || !news.mediaInfo.height) return res.status(500).json({msg: "You need to select one news before."})
        const {width} = news.mediaInfo
        const {height} = news.mediaInfo
        const wait = (ms: number) => new Promise(resolve => setTimeout(resolve,ms))
        ////START
        await makeDir(PUBLIC_PATH, res)
        await Promise.all(
            description.map(async (text:string,index:number) => {
                //const delayIndex = index + 2
                const delay = parseInt(`${index}000`)
                await wait(delay)
                const loop = await createAudio(text, index, audio, res)
                const finalImage = await _createImage(text,news,textColor,width,height,fontSize,format,res)
                await saveImageToDisk(finalImage.toString(), index)
                await wait(delay)
                const imagePath = `${PUBLIC_PATH}/image${index}.webp`
                localImages.push({path: imagePath, loop:loop})
                images.push(finalImage) //CLIENT
            })
        )
            audioconcat(audio)
            .concat(`${PUBLIC_PATH}/final.mp3`)
            .on('start', function(command:string) {
                //console.log('ffmpeg process started:', command)
            })
            .on('error', function (err:string, stdout:string, stderr:string) {
                console.error('Error:', err)
                console.error('ffmpeg stderr:', stderr)
            })
            .on('end', function(output:string) {
                cloudinary.v2.uploader.upload(`${PUBLIC_PATH}/final.mp3`, {upload_preset: 'bbaby_gov_video', resource_type: 'video'}).then(finalAudio => {
                    res.json({
                        title: news.title,
                        description: `Bbabystyle è un social network indipendente,esistiamo solo grazie a voi.
                        Questo è il link all'articolo completo: https://bbabystyle.com/news/${newsId} .
                        Contribuisci a far crescere bbabystyle https://bbabystyle.com`,
                        keywords: `Ucraina, News, Notizie`,
                        category: `25`,
                        privacyStatus: `public`,
                        images,
                        localImages,
                        audio,
                        finalAudio: finalAudio.secure_url,
                        width,
                        height,
                        msg:'Image created successfully'
                    })
                })
            })
    },
    createVideo: async (req: Request, res: Response) => {
        try {
            const {_videoOptions,images} = req.body;
            if (!images) return res.status(500).json({msg: "You have 0 images selected. Was this  a bug?"})
            const videoOptions = {
                fps: _videoOptions.fps,
                transition: _videoOptions.transition,
                transitionDuration: _videoOptions.transitionDuration, // seconds
                videoBitrate: 1024,
                videoCodec: 'libx264',
                size: '640x?',
                audioBitrate: '128k',
                audioChannels: 2,
                format: 'mp4',
                pixelFormat: 'yuv420p'
            }
            videoshow(images,videoOptions)
            .audio(`${PUBLIC_PATH}/final.mp3`)
            .save(`${PUBLIC_PATH}/video1.mp4`)
            .on('error', function(err:string,stdout:string,stderr:string) {
                return res.status(500).json({msg: `Some error occured ${err ? err : stdout ? stdout : stderr}`})
            })
            .on('end', (output:string) => {
                cloudinary.v2.uploader.upload(output, {
                    upload_preset: 'bbaby_gov_video',
                    resource_type: 'video'},
                    (err,response) => {
                    if (err) return res.status(500).json({msg: err.message})
                    return res.status(201).json({
                        msg: "Video created successfully",
                        video: response?.secure_url
                    })
                })
            })
        } catch (err) {
            if (err instanceof Error)
            res.status(500).json({msg: err.message})
        }
    },
    translateTweet: async (req: Request, res: Response) => {
        try {
            const translationClient = new TranslationServiceClient()
            const {text} = req.body
            const {lang} = req.query
            const projectId = 'bbabystyle'
            const location = 'us-central1'
            async function translateText() {
                const request = {
                    parent: `projects/${projectId}/locations/${location}`,
                    contents: [text],
                    mimeType: 'text/plain',
                    sourceLanguageCode: lang === 'en' ? lang : 'it',
                    targetLanguageCode: lang === 'en' ? 'it' : 'en'
                }
                const [response] = await translationClient.translateText(request)
                if (!response.translations) return res.status(500).json({msg: "Cannot translate!"})
                for (const translation of response.translations) {
                    res.json(translation.translatedText)
                }
            }
            
            translateText()   
        } catch (err) {
            if (err instanceof Error)
            res.status(500).json({msg: err.message})
        }
    },
    getArticles: async (req: Request, res: Response) => {
        try {
            const {token} = req.cookies
            if (!token) return res.status(500).json({msg: "You need to login first"})
            const user = await getUserFromToken(token);
            if (!user) return res.status(401).json({msg: "Your token is no more valid, please try to logout and login again."})
            if (user.role < 1) return res.status(500).json({msg: "You need to be an admin to access this API"})
            const browser = await puppeteer.launch()
            const page = await browser.newPage()
            const url = `https://www.bbc.com`
            await page.goto(url);
            const links = await page.evaluate(() => 
                Array.from(document.querySelectorAll("a.media__link") as NodeListOf<HTMLAnchorElement>).map((link) => (
                    link.href
                )
            ));
            await browser.close()
            res.set('Cache-control', 'public, max-age=3600')
            res.status(200).json(links)
        } catch (err) {
            if (err instanceof Error) 
            res.status(500).json({msg : err.message})
        }
    },
    getArticle: async (req: Request, res: Response) => {
        try {
            const {url} = req.body;
            const {token} = req.cookies
            if (!token) return res.status(500).json({msg: "You need to login first"})
            const user = await getUserFromToken(token);
            if (!user) return res.status(401).json({msg: "Your token is no more valid, please try to logout and login again."})
            if (user.role < 1) return res.status(500).json({msg: "You need to be an admin to access this page"})
            const browser = await puppeteer.launch({
                args: ['--no-sandbox', '--disabled-setupid-sandbox']
            })
            const page = await browser.newPage();
            await page.goto(url);
            const description = await page.evaluate(() => 
                Array.from(document.querySelectorAll('article p') as NodeListOf<HTMLParagraphElement>).map((descr) => (
                    `${descr.innerText}\n\n`
                ))
            )
            await browser.close()
            res.status(200).json(description)
        } catch (err) {
            if (err instanceof Error) {
                res.status(500).json({msg: err.message})
            }
            
        }
    },
    postArticle: async (req: Request, res: Response) => {
        try {
            const {token} = req.cookies
            if (!token) return res.status(500).json({msg: "You need to login first"})
            const user = await getUserFromToken(token);
            if (!user) return res.status(401).json({msg: "Your token is no more valid, please try to logout and login again."})
            if (user.role < 1) return res.status(500).json({msg: "You need to be an admin to access this page"})
            const {title,description,mediaInfo} = req.body;
            if (!title || !description || !mediaInfo.image) return res.status(500).json({msg: 'Missing required input!'})
            const width = mediaInfo.width >= 1920 ? 1920 : parseInt(mediaInfo.width);
            const height = mediaInfo.height >= 1080 ? 1080 : parseInt(mediaInfo.height);
            let savedNews:any = {}
            const news = new News({
                author: user.username,
                title,
                description,
                mediaInfo
            })
            savedNews = await news.save()
            const newImage = await cloudinary.v2.uploader.upload(mediaInfo.image, {
                upload_preset: 'bbaby_news',
                public_id: savedNews._id.toString(),
                transformation: {width, height, crop: 'fill'}
            })
            if (!newImage) return res.status(500).json({msg: "This image cannot be uploaded."})
            savedNews = await News.findByIdAndUpdate({_id: savedNews._id}, {$set: {'mediaInfo.image': newImage.secure_url}})
            savedNews = await News.findById(savedNews._id);
            res.status(201).json(savedNews);
        } catch (err) {
            if (err instanceof Error) {
                res.status(500).json({msg: err.message})
            }
        }
    },
    getPexelsImage: async (req: Request, res: Response) => {
        try {
            const {token} = req.cookies
            const {PEXELS_API_KEY} = config
            if (!token) return res.status(500).json({msg: "You need to login first"})
            const user = await getUserFromToken(token);
            if (!user) return res.status(401).json({msg: "Your token is no more valid, please try to logout and login again."})
            if (user.role < 1) return res.status(500).json({msg: "You need to be an admin to access this page"})
            const {text, page} = req.query
            const client = createClient(PEXELS_API_KEY)
            if (text === undefined) return res.status(500).json({msg: "You need to insert a phrase to be searched"})
            if (page === undefined) return res.status(500).json({msg: "You need to insert a phrase to be searched"})
            const photos = await client.photos.search({query: text.toString(),orientation: 'landscape', per_page: 15, page: parseInt(page.toString())})
            res.status(200).json(photos);
        } catch (err) {
            if (err instanceof Error)
            res.status(500).json({msg: err.message})
        }
    },
}

export default governanceCtrl;