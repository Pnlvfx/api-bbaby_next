import {google} from 'googleapis'
import config from '../../../config/config'
import fs from 'fs'
import express from 'express'
import { OAuth2Client } from 'google-auth-library'
import readline from 'readline'

const {PUBLIC_PATH,YOUTUBE_CREDENTIALS,YOUTUBE_CLIENT_ID,YOUTUBE_CLIENT_SECRET,CLIENT_URL} = config
const {OAuth2} = google.auth
const TOKEN_PATH = `${YOUTUBE_CREDENTIALS}/youtube_oauth_token.json`
const videoFilePath = `${PUBLIC_PATH}/video1.mp4`
const thumbFilePath = `${PUBLIC_PATH}/image0.webp`

export const authorize = (callback:Function,res:express.Response) => {
    const redirectUrl = `${CLIENT_URL}/governance/youtube`
    const oauth2Client = new OAuth2(YOUTUBE_CLIENT_ID,YOUTUBE_CLIENT_SECRET,redirectUrl)
    fs.readFile(TOKEN_PATH, (err,token) => {
        if (err) {
            getNewToken(oauth2Client,callback,res)
        } else {
            oauth2Client.credentials = JSON.parse(token.toString())
            callback(oauth2Client)
        }
    })
}

export const getNewToken = (oauth2Client:OAuth2Client,callback:Function,res:express.Response) => {
    const SCOPES = ['https://www.googleapis.com/auth/youtube.upload']
    const authUrl = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES,
        prompt: 'consent'
    })
    console.log(`Authorize this app by visiting this url: ${authUrl}`)
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    rl.question('Enter the code from that page here:', (code) => {
        rl.close()
        oauth2Client.getToken(code, (err,token:any) => {
            if (err) return res.status(500).json({msg: `Error while trying to retrive access token: ${err.message}`})
            oauth2Client.credentials = token
            storeToken(token,res)
            callback(oauth2Client)
        })
    })
}

const storeToken = (token:any,res:express.Response) => {
    fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
        if (err) return res.status(500).json({msg: `Error when trying to write the file to disk ${err.message}`})
        console.log(`token stored to ${TOKEN_PATH}`)
    })
}

export const uploadVideo = (auth:any,title:string,description:string,tags:string[],privacyStatus:string,res:express.Response) => {
    const youtube = google.youtube('v3')
    youtube.videos.insert({
        auth,
        part: ['snippet,status'],
        requestBody: {
            snippet: {
                title,
                description,
                tags,
                categoryId: '25',
                defaultAudioLanguage: 'it',
                defaultLanguage: 'it'
            },
            status: {
                privacyStatus
            },
        },
        media: {
            body: fs.createReadStream(videoFilePath)
        }
    }, 
    (err:any,response: any) => {
        if (err) return res.status(500).json({msg: `Error while trying to upload the video: ${err.message}`})
        const videoInfo = response?.data
        console.log(`Video uploaded successfully. Uploading the thumbnail now`)
        youtube.thumbnails.set({
            auth: auth,
            videoId: response?.data.id,
            media: {
                body: fs.createReadStream(thumbFilePath)
            },
        },
        (err:any,response:any) => {
            if (err) return res.status(500).json({msg: `Error while trying to upload the thumbnail: ${err.message}`})
        })
        fs.rm(`${PUBLIC_PATH}`, {recursive: true}, (err) => {
            if (err) return res.status(500).json({msg: `Cannot delete this folder`})
            res.status(201).json({videoInfo: videoInfo, msg: `Video and thumbnail updated successfully`})
        })
    })
}