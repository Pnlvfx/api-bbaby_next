import express from 'express'
import config from '../../config/config'
import Comment from '../../models/Comment'
import Post from '../../models/Post'
import {concatenateAudio, createAudio, makeDir,saveImageToDisk,_createImage} from './createImage'
import cloudinary from '../../lib/cloudinary'
import videoshow from 'videoshow'
import fs from 'fs'
import { authorize, uploadVideo } from './uploadYoutube'

const {PUBLIC_PATH,YOUTUBE_CREDENTIALS} = config

const governanceCtrl = {
    createImage: async (req:express.Request, res: express.Response) => {
        const {textColor,fontSize,community,format} = req.body
        const post:any = await Post.findOne({"mediaInfo.isImage": true, community: community}).sort({createdAt: -1}).limit(1).skip(0)
        const texts = await Comment.find({rootId: post?._id}).sort({createdAt: -1})
        texts.push(post)
        texts.reverse()
        let images:any = []
        let localImages:any = []
        let audio:any = []
        const width = post.mediaInfo.dimension[1]
        const height = post.mediaInfo.dimension[0]
        const wait = (ms: number) => new Promise(resolve => setTimeout(resolve,ms))
        ////START
        await makeDir(PUBLIC_PATH, res)
        await Promise.all(
            texts.map(async (text:any,index:number) => {
                //const delayIndex = index + 2
                const delay = parseInt(`${index}000`)
                await wait(delay)
                const loop = await createAudio(text.title ? text.title : text.body, index,audio)
                const finalImage = await _createImage(text.title ? text.title : text.body,post,textColor,width,height,fontSize,format,res)
                await saveImageToDisk(finalImage, index)
                await wait(delay)
                const imagePath = `${PUBLIC_PATH}/image${index}.webp`
                localImages.push({path: imagePath, loop:loop})
                images.push(finalImage) //CLIENT
            })
        )
        await concatenateAudio(audio)
        const finalAudio = await cloudinary.v2.uploader.upload(`${PUBLIC_PATH}/final.mp3`, {upload_preset: 'bbaby_gov_video', resource_type: 'video'})
        res.json({
            title: post.title,
            description: `Bbabystyle è un social network indipendente,esistiamo solo grazie a voi. Contribuisci a far crescere bbabystyle https://bbabystyle.com`,
            keywords: `Ucraina, News, Notizie`,
            category: `25`,
            privacyStatus: `public`,
            images,
            localImages: localImages,
            audio,
            finalAudio: finalAudio.secure_url,
            width,
            height,
            success:'Image created successfully'
        })
    },
    createVideo: async (req:express.Request, res: express.Response) => {
        try {
            const {_videoOptions,images} = req.body
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
                res.status(500).json({msg: `Some error occured ${err ? err : stdout ? stdout : stderr}`})
            })
            .on('end', (output:string) => {
                //console.log(output)
                cloudinary.v2.uploader.upload(output, {upload_preset: 'bbaby_gov_video', resource_type: 'video'}, (err,response) => {
                    if (err) return res.status(500).json({msg: err.message})
                    res.status(201).json({
                        success: "Video created successfully",
                        video: response?.secure_url
                    })
                })
            })
        } catch (err:any) {
            res.status(500).json({msg: err.message})
        }
    },
    uploadYoutube: async (req:express.Request, res: express.Response) => {
        try {
            const {title,description,tags,categoryId,privacyStatus} = req.body
            fs.readFile(`${YOUTUBE_CREDENTIALS}/youtube_client_secret.json`, function processClientSecrets(err,content) {
                if (err) return res.status(500).json({msg: `Error during processClientSecrets : ${err.message}`})
                authorize(JSON.parse(content.toString()), (auth:any) => uploadVideo(auth,title,description,tags,privacyStatus,res),res)
            })
        } catch {

        }
    }
}

export default governanceCtrl;