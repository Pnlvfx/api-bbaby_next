import type {Request, Response} from 'express';
import type { UserRequest } from '../../@types/express';
import config from '../../config/config';
import {createAudio, _createImage} from './gov-functions/createImage';
import videoshow from 'videoshow';
import audioconcat from 'audioconcat';
import News from '../../models/News';
import BBC from '../../models/BBC';
import { linkPreview, LinkPreviewProps } from '../../externals/linkPreview';
import  coraline  from '../../database/coraline';
import telegramapis from '../../lib/telegramapis';
import bbcapis from '../../lib/bbcapis';
import { catchErrorCtrl } from '../../lib/common';
import googleapis from '../../lib/googleapis/googleapis';
import { coralinemkDir } from '../../database/utils/coralineFunctions';


const governanceCtrl = {
    createImage: async (expressRequest: Request, res: Response) => {
        try {
            const req = expressRequest as UserRequest;
            const {textColor, fontSize, description, title} = req.body;
            if (description.length <= 1) return res.status(400).json({msg: "Please select at least 2 paragraph."});
            const news = await News.findOne({ title });
            if (!news) {return res.status(400).json({msg: "Invalid request, this article does not exist."})}
            description.reverse().push(news.title)
            description.reverse();
            let images: string[] = []
            let localImages: any = []
            let audio: string[] = []
            const {width, height} = news.mediaInfo;
            const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
            const youtubePath = coraline.use('youtube');
            await Promise.all(
                description.map(async (text: string, index: number) => {
                    const delay = parseInt(`${index}000`)
                    await wait(delay)
                    const loop = await createAudio(text, index, audio);
                    const finalImage = await _createImage(text, news, textColor, width, height, parseInt(fontSize), 'png', index);
                    localImages.push({path: finalImage.filename, loop})
                    images.push(finalImage.url) //CLIENT
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
                const base_url = config.SERVER_URL;
                const url = `${base_url}/gov/youtube/final.mp3`;
                res.json({
                    title: news.title,
                    description: `Bbabystyle è un social network indipendente,esistiamo solo grazie a voi. Questo è il link all'articolo completo: https://www.bbabystyle.com/news/${news.title.toLowerCase()}. Contribuisci a far crescere bbabystyle https://www.bbabystyle.com`,
                    keywords: `Ucraina, News, Notizie`,
                    category: `25`,
                    privacyStatus: `public`,
                    images,
                    localImages,
                    audio,
                    finalAudio: url,
                    width,
                    height,
                    msg:'Image created successfully'
                })
            })
        } catch (err) {
            catchErrorCtrl(err, res);
        }
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
                size: '1920x?',
                audioBitrate: '128k',
                audioChannels: 2,
                format: 'mp4',
                pixelFormat: 'yuv420p'
            }
            const youtubePath = coraline.use('youtube')
            videoshow(images,videoOptions)
            .audio(`${youtubePath}/final.mp3`)
            .save(`${youtubePath}/video1.mp4`)
            .on('error', function(err:string,stdout:string,stderr:string) {
                return res.status(500).json({msg: `Some error occured ${err ? err : stdout ? stdout : stderr}`})
            })
            .on('end', (output:string) => {
                const base_url = config.SERVER_URL;
                const url = `${base_url}/gov/youtube/video1.mp4`;
                return res.status(201).json({msg: "Video created successfully",video: url});
            })
        } catch (err) {
            catchErrorCtrl(err, res);
        }
    },
    translate: async (expressRequest: Request, res: Response) => {
        try {
            const req = expressRequest as UserRequest;
            const { text } = req.body;
            if (!text) return res.status(400).json({msg: "You need to send one text with in your request body."});
            const {lang} = req.query;
            if (!lang) return res.status(400).json({msg: "Add the source language in your query url."});
            const path = coraline.use('token');
            const filename = `${path}/translate_token.json`;
            let credentials = await coraline.readJSON(filename);
            if (!credentials) {
                credentials = await googleapis.serviceAccount.getAccessToken('translate');
            }
            let translation = await googleapis.translate(text, lang.toString(), credentials);
            if (!translation) {
                credentials = await googleapis.serviceAccount.getAccessToken('translate');
                translation = await googleapis.translate(text, lang.toString(), credentials);
            }
            res.status(200).json(translation);
        } catch (err) {
            catchErrorCtrl(err, res);
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
                await Promise.all(
                    links.map(async (link) => {
                        const exists = await BBC.exists({link});
                        if (exists) return;
                        const {title, image, description} = await linkPreview(link); //metadata
                        const permalink = buildUnderscoreUrl(`/governance/news/${title}`);
                        console.log(permalink)
                        if (!title || !image) return;
                        const news = new BBC({
                            title,
                            description,
                            image,
                            link,
                            permalink
                        })
                        const save = await news.save()
                        scraped += 1
                    })
                )
                const allNews = await BBC.find({});
                total = allNews.length;
            }
            response = await BBC.find({}).sort({createdAt: -1}).limit(_limit).skip(_skip);
            await telegramapis.sendLog(`totalNewsScraped : ${scraped}`);
            res.status(200).json({
                data: response,
                total
            });
        } catch (err) {
            catchErrorCtrl(err, res);
        }
    },
    getArticleDescription: async (expressRequest: Request, res: Response) => {
        try {
            const req = expressRequest as UserRequest;
            const {permalink} = req.body;
            if (!permalink) return res.status(400).json({msg: "Missing redirect link parameters"});
            const BBCnews = await BBC.findOne({permalink});
            if (!BBCnews) return res.status(400).json({msg: "This news doesn't exist!"});
            if (!BBCnews.full_description) {
                const full_description = await bbcapis.getDescription(BBCnews.link);
                BBCnews.full_description = full_description.join('');
                await BBCnews.save()
            }
            res.status(200).json(BBCnews);
        } catch (err) {
            catchErrorCtrl(err, res);
        }
    },
    postArticle: async (expressRequest: Request, res: Response) => {
        try {
            const req = expressRequest as UserRequest;
            const {user} = req;
            const {title, description, mediaInfo} = req.body;
            if (!title || !description || !mediaInfo.image) return res.status(400).json({msg: 'Missing required input!'});
            const exists = await News.exists({title});
            if (exists) return res.status(400).json({msg: "This news has already been shared!"})
            const permalink = buildUnderscoreUrl(`/news/${title}`);
            const news = new News({
                author: user.username,
                title,
                description,
                mediaInfo
            });
            const public_id = `news/${news._id}`;
            coralinemkDir('static/images/news');
            const bigImage = await coraline.getMediaFromUrl(mediaInfo.image, public_id, 'images');
            const newImage = await coraline.resize(bigImage);
            news.$set({'mediaInfo.image': newImage.url, 'mediaInfo.width': 1920, 'mediaInfo.height': 1080});
            const savedNews = await news.save();
            res.status(201).json(savedNews);
        } catch (err) {
            catchErrorCtrl(err, res);
        }
    },
    getPexelsImage: async (expressRequest: Request, res: Response) => {
        try {
            const req = expressRequest as UserRequest;
            const {PEXELS_API_KEY} = config;
            const { text } = req.query;
            if (!text) return res.status(400).json({msg: "Please add a search text in your query params."})
            const orientation = 'landscape'  //landscape / portrait
            const base_url = `https://api.pexels.com/v1/search?query=${text}&orientation=${orientation}`;
            const headers = {
                Authorization: PEXELS_API_KEY
            }
            const response = await fetch(base_url, {
                method: 'GET',
                headers
            });
            const data = await response.json();
            if (!response.ok) return res.status(500).json({msg: "Pexels API error."});
            res.status(200).json(data.photos);
        } catch (err) {
            catchErrorCtrl(err, res);
        }
    },
}

export default governanceCtrl;

export const buildUnderscoreUrl = (url: string) => {
    const bo = url
    .toLowerCase()
    .replaceAll(' ', '_')
    .replaceAll('%', '')
    .replaceAll(':', '')
    .replaceAll("'", "")
    .replaceAll('"', '')
    .replaceAll(',', '')
    .replaceAll('?', '')
    .replaceAll('-', '')
    .replaceAll('’', '')
    return bo;
}