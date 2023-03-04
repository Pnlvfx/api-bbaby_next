import type { Request, Response } from 'express';
import type { UserRequest } from '../../@types/express';
import config from '../../config/config';
import { createAudio, _createImage } from './gov-functions/createImage';
import videoshow from 'videoshow';
import audioconcat from 'audioconcat';
import News from '../../models/News';
import BBC from '../../models/BBC';
import coraline from '../../coraline/coraline';
import { catchError, catchErrorCtrl } from '../../coraline/cor-route/crlerror';
import pexelsapi from '../../lib/pexelsapi/pexelsapi';
import telegramapis from '../../lib/telegramapis/telegramapis';
import { TwitterApi } from 'twitter-api-v2';
import twitterapis from '../../lib/twitterapis/twitterapis';
import bbabyapis from '../../lib/bbabyapis/bbabyapis';

const governanceCtrl = {
  createImage: async (expressRequest: Request, res: Response) => {
    try {
      const req = expressRequest as UserRequest;
      const {
        textColor,
        fontSize,
        description,
        title,
      }: {
        textColor: string;
        fontSize: string;
        description: string[];
        title: string;
      } = req.body;
      if (description.length <= 1) return res.status(400).json({ msg: 'Please select at least 2 paragraph.' });
      const news = await News.findOne({ title });
      if (!news) return res.status(400).json({ msg: 'Invalid request, this article does not exist.' });
      description.reverse().push(news.title);
      description.reverse();
      const images: string[] = [];
      const localImages: FFmpegImage[] = [];
      const audio: string[] = [];
      const { width, height } = news.mediaInfo;
      const folder = coraline.useStatic('youtube');
      await Promise.all(
        description.map(async (text, index) => {
          try {
            await coraline.wait(index * 2000);
            const audioPath = `${folder}/audio${index}.mp3`;
            const loop = await createAudio(text, audio, audioPath);
            const finalImage = await _createImage(text, news, textColor, width, height, parseInt(fontSize), index);
            localImages.push({ path: finalImage.filename, loop });
            images.push(finalImage.url); //CLIENT
          } catch (err) {
            throw catchError(err);
          }
        }),
      );
      const audio_path = `${folder}/final.mp3`;
      audioconcat(audio)
        .concat(`${folder}/final.mp3`)
        .on('error', (err: string, stdout: string, stderr: string) => {
          return res.status(500).json(`${err}, ${stderr}, ${stdout}`);
        })
        .on('end', () => {
          const audio_url = coraline.media.getUrlFromPath(audio_path);
          res.json({
            title: news.title,
            description: `Bbabystyle è un social network indipendente,esistiamo solo grazie a voi. Questo è il link all'articolo completo: https://www.bbabystyle.com/news/${news.title.toLowerCase()}. Contribuisci a far crescere bbabystyle https://www.bbabystyle.com`,
            keywords: `Ucraina, News, Notizie`,
            category: `25`,
            privacyStatus: `public`,
            images,
            localImages,
            audio,
            finalAudio: audio_url,
            width,
            height,
            msg: 'Image created successfully',
          });
        });
    } catch (err) {
      catchErrorCtrl(err, res);
    }
  },
  createVideo: async (expressRequest: Request, res: Response) => {
    try {
      const req = expressRequest as UserRequest;
      const { _videoOptions, images } = req.body;
      if (!images) return res.status(400).json({ msg: 'You have 0 images selected.' });
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
        pixelFormat: 'yuv420p',
      };
      const youtubePath = coraline.useStatic('youtube');
      const videoPath = `${youtubePath}/video1.mp4`;
      videoshow(images, videoOptions)
        .audio(`${youtubePath}/final.mp3`)
        .save(videoPath)
        .on('error', function (err: string, stdout: string, stderr: string) {
          return res.status(500).json({ msg: `Some error occured ${err ? err : stdout ? stdout : stderr}` });
        })
        .on('end', () => {
          const url = coraline.media.getUrlFromPath(videoPath);
          return res.status(201).json({ msg: 'Video created successfully', video: url });
        });
    } catch (err) {
      catchErrorCtrl(err, res);
    }
  },
  translate: async (expressRequest: Request, res: Response) => {
    try {
      const req = expressRequest as UserRequest;
      const { text } = req.body;
      if (!text) return res.status(400).json({ msg: 'You need to send one text with in your request body.' });
      const { lang } = req.query;
      if (!lang) return res.status(400).json({ msg: 'Add the source language in your query url.' });
      const to = lang === 'en' ? 'it' : 'en';
      const translation = await bbabyapis.translate(text, lang.toString(), to);
      res.status(200).json(translation);
    } catch (err) {
      catchErrorCtrl(err, res);
    }
  },
  getBBCarticles: async (expressRequest: Request, res: Response) => {
    try {
      const req = expressRequest as UserRequest;
      const { limit, skip } = req.query;
      if (!limit || !skip) return res.status(400).json({ msg: 'This API require a pagination query params!' });
      const threeDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);
      const now = new Date();
      const news = await BBC.find({ description: { $ne: 'Not found' }, date: { $gte: threeDaysAgo.toISOString(), $lt: now.toISOString() } })
        .sort({ date: -1 })
        .limit(Number(limit.toString()))
        .skip(Number(skip.toString()));
      //news = news.sort((a, b) => a.description.length - b.description.length);
      res.status(200).json(news);
    } catch (err) {
      catchErrorCtrl(err, res);
    }
  },
  getBBCarticle: async (expressRequest: Request, res: Response) => {
    try {
      const req = expressRequest as UserRequest;
      const { permalink } = req.params;
      if (!permalink) return res.status(400).json({ msg: 'Missing permalink parameters' });
      const perma = `/governance/news/${permalink}`;
      const BBCnews = await BBC.findOne({ permalink: perma });
      if (!BBCnews) return res.status(400).json({ msg: "This news doesn't exist!" });
      res.status(200).json(BBCnews);
    } catch (err) {
      catchErrorCtrl(err, res);
    }
  },
  postArticle: async (expressRequest: Request, res: Response) => {
    try {
      const req = expressRequest as UserRequest;
      const { user } = req;
      const { title, description, mediaInfo, sharePostToTG, sharePostToTwitter } = req.body;
      if (!title || !description || !mediaInfo.image) return res.status(400).json({ msg: 'Missing required input!' });
      const exists = await News.exists({ title });
      if (exists) return res.status(400).json({ msg: 'This news has already been shared!' });
      const permalink = `/news/${coraline.createPermalink(title)}`;
      const news = new News({
        author: user.username,
        title,
        description,
        permalink,
        mediaInfo,
      });
      const public_id = `news/${news._id}`;
      coraline.use('images/news');
      const bigImage = await coraline.media.getMediaFromUrl(mediaInfo.image, public_id, 'images');
      const newImage = await coraline.media.image.resize(bigImage);
      news.$set({ 'mediaInfo.image': newImage.url, 'mediaInfo.width': 1920, 'mediaInfo.height': 1080 });
      await news.save();
      const url = `${config.CLIENT_URL}${news.permalink}`;
      if (sharePostToTG) {
        const text = `${news.title + ' ' + url}`;
        const chat_id = '@bbabystyle1';
        await telegramapis.sendMessage(chat_id, text);
      }
      if (sharePostToTwitter) {
        try {
          const twitterText = news.title.substring(0, 300 - url.length - 10) + ' ' + url;
          const twitterUser = new TwitterApi({
            appKey: config.TWITTER_CONSUMER_KEY,
            appSecret: config.TWITTER_CONSUMER_SECRET,
            accessToken: config.BBABYITALIA_ACCESS_TOKEN,
            accessSecret: config.BBABYITALIA_ACCESS_TOKEN_SECRET,
          });
          const twimage = await twitterUser.v1.uploadMedia(Buffer.from(newImage.filename));
          await twitterapis.tweet(twitterUser, twitterText, twimage);
        } catch (err) {
          await news.deleteOne();
          throw catchError(err);
        }
      }
      res.status(201).json(news);
    } catch (err) {
      catchErrorCtrl(err, res);
    }
  },
  getPexelsImage: async (expressRequest: Request, res: Response) => {
    try {
      const req = expressRequest as UserRequest;
      const { text } = req.query;
      if (!text) return res.status(400).json({ msg: 'Please add a search text in your query params.' });
      const photos = await pexelsapi.getImage(text.toString());
      res.status(200).json(photos);
    } catch (err) {
      catchErrorCtrl(err, res);
    }
  },
};

export default governanceCtrl;
