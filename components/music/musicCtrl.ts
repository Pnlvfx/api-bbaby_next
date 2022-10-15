import { Request, Response } from 'express';
import fs from 'fs';
import coraline from '../../database/coraline';
import { catchErrorCtrl } from '../../lib/common';
import config from '../../config/config';
import YoutubeMp3Downloader from 'youtube-mp3-downloader';
import puppeteer from 'puppeteer';
import getAudioDurationInSeconds from 'get-audio-duration';

const musicCtrl = {
    search: async (req: Request, res: Response) => {
        try {
            const {text} = req.body;
            const path = coraline.use('puppeteer');

            const browser = await puppeteer.launch({
                args: ['--no-sandbox', '--disabled-setupid-sandbox']
            });
            const page = await browser.newPage();
            const url = `https://www.youtube.com/results?search_query=${text}`;
            await page.goto(url);
            await page.screenshot({path: `${path}/test.png`})
            const data = await page.evaluate(() =>
                Array.from(document.querySelectorAll("#video-title") as NodeListOf<HTMLAnchorElement>).map((title) => (
                    {title: title.title, link: title.href}
                )
            ));
            console.log({data});
            await browser.close();
            res.status(200).json(data);
        } catch (err) {
            console.log(err);
            catchErrorCtrl(err, res);
        }
    },
    downloadMusic: async (req: Request, res: Response) => {
        try {
            const {url} = req.body;
            const path = coraline.use('music');
            const YD = new YoutubeMp3Downloader({
                "ffmpegPath": '/usr/bin/ffmpeg',
                outputPath: path,
                youtubeVideoQuality: 'highestaudio',
                "queueParallelism": 2,
                "progressTimeout": 2000, 
                "allowWebm": false
            })
            const id = url.split('v=')[1];
            YD.download(id);
            YD.on('finished', (err, data) => {
                getAudioDurationInSeconds(data.file).then((duration) => {
                    const songUrl = `${config.SERVER_URL}/music/${data.videoId}`;
                    const track = {
                        id: data.videoId,
                        url: songUrl,
                        type: 'default',
                        contentType: 'audio/mp3',
                        duration,
                        title: data.title,
                        artist: data.artist,
                        album: '',
                        description: '',
                        genre: '',
                        date: '',
                        artwork: data.thumbnail,
                        videoTitle: data.videoTitle,
                        videoId: data.videoId

                    }
                    const filename = `${path}/allsongs.json`;
                    const exists = fs.existsSync(filename);
                    if (!exists) {
                        const array = JSON.stringify([track]);
                        const write = coraline.saveJSON(filename, array).then((file) => {
                            res.status(200).json({msg: true});
                        })
                    } else {
                        const read = coraline.readJSON(filename).then((file) => {
                            file.push(track);
                            const save = coraline.saveJSON(filename, file).then(() => {
                                res.status(200).json({msg: true});
                            })
                        })
                    }
                })
            })
            YD.on('error', (error) => {
                console.log(error)
            })
            YD.on('progress', (progress) => {
                console.log(JSON.stringify(progress))
            })
        } catch (err) {
            catchErrorCtrl(err, res);
        }
    },
    singleMusic : async (req: Request, res: Response) => {
        try {
            const {id} = req.params;
            const path = coraline.use('music');
            const allSongs = await coraline.readJSON(`${path}/allsongs.json`) as SongProps[];
            const song = allSongs.find((song) => song.videoId === id);
            if (!song) return res.status(400).json({msg: "This song doesn't exist."});
            const music = `${path}/${song.videoTitle}.mp3`;
            const stream = fs.createReadStream(music);
            stream.pipe(res);
            // console.log(music);
            // const musicStat = await fsPromises.stat(music);
            // console.log(musicStat)
            // const musicSize = musicStat.size;
            // const CHUNK_SIZE = 10 ** 6; //1mb
            // const start = Number(range?.replace(/\D/g, ""))
            // const end = Math.min(start + CHUNK_SIZE, musicSize -1);
            // const contentLength = end - start + 1;
            // const headers = {
            //     "Content-range" : `bytes ${start}-${end}/${musicSize}`,
            //     "Accept-ranges": "bytes",
            //     "Content-length": contentLength,
            //     "Content-Type": "audio/mp3",
            //     "Cache-Control": "public, max-age=1309600, s-max-age=86400, must-revalidate"
            // };
            // res.writeHead(206, headers);
            // const videoStream = fs.createReadStream(music, { start, end });
            // videoStream.pipe(res);
        } catch (err) {
            catchErrorCtrl(err, res);
        }
    },
    all: async (req: Request, res: Response) => {
        try {
            const path = coraline.use('music');
            const filename = `${path}/allsongs.json`;
            const file = await coraline.readJSON(filename);
            res.status(200).json(file);
        } catch (err) {
            catchErrorCtrl(err, res);
        }
    },
}

export default musicCtrl;
