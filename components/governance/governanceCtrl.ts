import type {Request, Response} from 'express';
import type { UserRequest } from '../../@types/express';
import config from '../../config/config';
import {createAudio, saveImageToDisk, _createImage} from './gov-functions/createImage';
import cloudinary from '../../lib/cloudinary';
import videoshow from 'videoshow';
import {TranslationServiceClient} from '@google-cloud/translate';
import audioconcat from 'audioconcat';
import { createClient, PhotosWithTotalResults } from 'pexels';
import News from '../../models/News';
import BBC from '../../models/BBC';
import { linkPreview, LinkPreviewProps } from '../../externals/linkPreview';
import  coraline  from '../../database/coraline';
import telegramapis from '../../lib/telegramapis';
import bbcapis from '../../lib/bbcapis';
import { catchErrorCtrl } from '../../lib/common';


const governanceCtrl = {
    createImage: async (expressRequest: Request, res: Response) => {
        const req = expressRequest as UserRequest;
        const {textColor,fontSize,description,newsId,format} = req.body;
        if (description.length <= 1) return res.status(400).json({msg: "Please select at least 2 paragraph."})
        const news = await News.findById(newsId);
        if (!news) return res.status(400).json({msg: "Invalid request, this article does not exist."})
        description.reverse()
        description.push(news.title)
        description.reverse()
        let images:any = []
        let localImages:any = []
        let audio:any = []
        if (!news || !news.mediaInfo.width || !news.mediaInfo.height) return res.status(500).json({msg: "You need to select one news before."})
        const {width} = news.mediaInfo
        const {height} = news.mediaInfo
        const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))
        const youtubePath = coraline.use('youtube')
        ////START
        await Promise.all(
            description.map(async (text: string,index: number) => {
                const delay = parseInt(`${index}000`)
                await wait(delay)
                const loop = await createAudio(text, index, audio, res)
                const finalImage = await _createImage(text,news,textColor,width,height,fontSize,format,res)
                await saveImageToDisk(finalImage.toString(), index)
                await wait(delay)
                const imagePath = `${youtubePath}/image${index}.webp`
                localImages.push({path: imagePath, loop:loop})
                images.push(finalImage) //CLIENT
            })
        )
            audioconcat(audio)
            .concat(`${youtubePath}/final.mp3`)
            .on('start', function(command: string) {
                //console.log('ffmpeg process started:', command)
            })
            .on('error', function (err: string, stdout: string, stderr: string) {
                console.error('Error:', err)
                console.error('ffmpeg stderr:', stderr)
            })
            .on('end', function(output: string) {
                cloudinary.v2.uploader.upload(`${youtubePath}/final.mp3`, {upload_preset: 'bbaby_gov_video', resource_type: 'video'}).then(finalAudio => {
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
    createVideo: async (expressRequest: Request, res: Response) => {
        try {
            const req = expressRequest as UserRequest;
            const {_videoOptions,images} = req.body;
            if (!images) return res.status(400).json({msg: "You have 0 images selected. Was this  a bug?"})
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
            const youtubePath = await coraline.use('youtube')
            videoshow(images,videoOptions)
            .audio(`${youtubePath}/final.mp3`)
            .save(`${youtubePath}/video1.mp4`)
            .on('error', function(err:string,stdout:string,stderr:string) {
                return res.status(500).json({msg: `Some error occured ${err ? err : stdout ? stdout : stderr}`})
            })
            .on('end', (output:string) => {
                cloudinary.v2.uploader.upload(output, {
                    upload_preset: 'bbaby_gov_video',
                    resource_type: 'video'},
                    (err,response) => {
                    if (err) return res.status(500).json({msg: err.message})
                    if (!response) return res.status(500).json({msg: "Cloudinary error"})
                    return res.status(201).json({msg: "Video created successfully",video: response.secure_url})
                })
            })
        } catch (err) {
            if (err instanceof Error)
            res.status(500).json({msg: err.message})
        }
    },
    translate: async (expressRequest: Request, res: Response) => {
        try {
            const req = expressRequest as UserRequest;
            const {text} = req.body;
            if (!text) return res.status(400).json({msg: "You need to send one text with in your request body."})
            const {lang} = req.query;
            if (!lang) return res.status(400).json({msg: "Add the source language in your query url."})
            const projectId = 'bbabystyle';
            const location = 'us-central1';
            const translationClient = new TranslationServiceClient();
            const translateText = async () => {
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
    getBBCnews: async (expressRequest: Request, res: Response) => { 
        try {
            const req = expressRequest as UserRequest;
            const {limit, skip} = req.query;
            if (!limit || !skip) return res.status(400).json({msg: "This API require a pagination query params!"})
            const _limit = parseInt(limit.toString());
            const _skip = parseInt(skip.toString());
            let response: Array<LinkPreviewProps | []> = [];
            let total = 0
            let scraped = 0;
            if (_skip === 0) {
                const links = await bbcapis.connect();
                if (!links) return res.status(500).json({msg: "No links found on the website"})
                await Promise.all(
                    links.map(async (link: string) => {
                        const metadata = await linkPreview(link);
                        if (!metadata?.title || !metadata.image) return;
                        const exists = await BBC.exists({title: metadata.title})
                        if (exists) return;
                        const news = new BBC({
                            title: metadata.title,
                            description: metadata.description,
                            image: metadata.image,
                            link
                        })
                        const save = await news.save()
                        scraped += 1
                    })
                )
                const allNews = await BBC.find({});
                total = allNews.length;
            }
            response = await BBC.find({}).sort({createdAt: -1}).limit(_limit).skip(_skip)
            //res.set('Cache-Control', 'private, max-age=0');
            res.status(200).json({
                data: response,
                total
            });
            telegramapis.sendLog(`totalNewsScraped : ${scraped}`);
            // const all = await BBC.find({});
            // await Promise.all(
            //     all.map(async (newsmap) => {
                    
            //         const full_description = await bbcapis.getDescription(newsmap.link)
            //         console.log(full_description);
            //     })
            // )
        } catch (err) {
            catchErrorCtrl(err, res);
        }
    },
    getArticleDescription: async (expressRequest: Request, res: Response) => {
        try {
            const req = expressRequest as UserRequest; 
            const {link} = req.body;
            if (!link) return res.status(400).json({msg: "Missing redirect link parameters"})
            const description = await bbcapis.getDescription(link);
            console.log(description);
            res.status(200).json(description)
        } catch (err) {
            catchErrorCtrl(err, res);
        }
    },
    postArticle: async (expressRequest: Request, res: Response) => {
        try {
            const req = expressRequest as UserRequest;
            const {user} = req;
            const {title,description,mediaInfo} = req.body;
            if (!title || !description || !mediaInfo.image) return res.status(500).json({msg: 'Missing required input!'})
            const width = mediaInfo.width >= 1920 ? 1920 : parseInt(mediaInfo.width);
            const height = mediaInfo.height >= 1080 ? 1080 : parseInt(mediaInfo.height);
            const news = new News({
                author: user.username,
                title,
                description,
                mediaInfo
            });
            let savedNews = await news.save();
            const newImage = await cloudinary.v2.uploader.upload(mediaInfo.image, {
                upload_preset: 'bbaby_news',
                public_id: savedNews._id.toString(),
                transformation: {width, height, crop: 'fill'}
            });
            if (!newImage) return res.status(500).json({msg: "This image cannot be uploaded."})
            savedNews.$set({mediaInfo: {image: newImage.secure_url}})
            res.status(201).json(savedNews);
        } catch (err) {
            if (err instanceof Error) {
                res.status(500).json({msg: err.message})
            }
        }
    },
    getPexelsImage: async (expressRequest: Request, res: Response) => {
        try {
            const req = expressRequest as UserRequest;
            const {PEXELS_API_KEY} = config;
            const {text, page} = req.query;
            const client = await createClient(PEXELS_API_KEY);
            if (!text) return res.status(400).json({msg: "Please add a search text in your query params."})
            if (!page) return res.status(500).json({msg: "Please add a pageNumber in your query params."})
            const pexelsData = await client.photos.search({query: text.toString(),orientation: 'landscape', per_page: 15, page: parseInt(page.toString())})
            if (!pexelsData) return res.status(400).json({msg: "No photos on pexels with this phrase."});
            const response = pexelsData as PhotosWithTotalResults;
            res.status(200).json(response.photos);
        } catch (err) {
            if (err instanceof Error)
            res.status(500).json({msg: err.message})
        }
    },
}

export default governanceCtrl;