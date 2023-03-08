import { Request, Response } from 'express';
import { catchErrorCtrl, catchErrorWithTelegram } from '../../../coraline/cor-route/crlerror';
import { UserRequest } from '../../../@types/express';
import Tiktak from '../../../models/Tiktak';
import coraline from '../../../coraline/coraline';
import tiktakapis from '../../../lib/tiktakapis/tiktakapis';
import telegramapis from '../../../lib/telegramapis/telegramapis';
import { apiconfig } from '../../../config/APIconfig';
import googleapis from '../../../lib/googleapis/googleapis';

const tiktakCtrl = {
  newTiktak: async (userRequest: Request, res: Response) => {
    try {
      const req = userRequest as UserRequest;
      const { title, text } = req.body;
      if (!title || !text) return res.status(400).json({ msg: 'Please add your text to the input.' });
      const { lang } = req.query;
      if (!lang) return res.status(400).json({ msg: 'Add the source language in your query url.' });
      const to = lang.toString() === 'en' ? 'it' : 'en';
      const permalink = `/governance/tiktak/${coraline.createPermalink(text)}`;
      const exist = await Tiktak.findOne({ original_body: text, permalink });
      if (exist) return res.status(200).json(exist);
      const titletranslation = await googleapis.translate(title, lang.toString(), to);
      const bodytranslation = await googleapis.translate(text, lang.toString(), to);
      // const prompt = `I want you to tell what is this story talking about in one word in english, just send the word without extra arguments: \n ${text}`;
      // const synthetize = await openaiapis.request(prompt);
      const tiktak = new Tiktak({
        original_title: title,
        title: titletranslation,
        original_body: text,
        body: bodytranslation,
        permalink,
      });
      await tiktak.save();
      res.status(201).json(tiktak);
    } catch (err) {
      catchErrorCtrl(err, res);
    }
  },
  getTiktaks: async (userRequest: Request, res: Response) => {
    try {
      const tiktaks = await Tiktak.find({}).sort({ createdAt: -1 }).limit(4);
      res.status(200).json(tiktaks);
    } catch (err) {
      catchErrorCtrl(err, res);
    }
  },
  getTiktak: async (userRequest: Request, res: Response) => {
    try {
      const req = userRequest as UserRequest;
      const { permalink } = req.params;
      const tiktak = await Tiktak.findOne({ permalink: `/governance/tiktak/${permalink}` });
      if (!tiktak) return res.status(400).json({ msg: 'There is no a tiktak with this id!' });
      res.status(200).json(tiktak);
    } catch (err) {
      catchErrorCtrl(err, res);
    }
  },
  createBgVideo: async (userRequest: Request, res: Response) => {
    try {
      const req = userRequest as UserRequest;
      const { permalink } = req.params;
      const { title, text, synthetize } = req.body;
      if (!text || !title) return res.status(400).json({ msg: 'Missing required parameter: text or title!' });
      const tiktak = await Tiktak.findOne({ permalink: `/governance/tiktak/${permalink}` });
      if (!tiktak) return res.status(400).json({ msg: 'There is no a tiktak with this id!' });
      if (synthetize) {
        tiktak.synthetize = synthetize;
      }
      tiktak.title = title;
      tiktak.body = text;
      await tiktak.save();
      await tiktakapis.backgroundVideo(tiktak, 1080, 1920);
      res.status(201).json(tiktak);
    } catch (err) {
      catchErrorWithTelegram('tiktakCtrl.createTiktak' + ' ' + err);
      catchErrorCtrl(err, res);
    }
  },
  createVideo: async (userRequest: Request, res: Response) => {
    try {
      const req = userRequest as UserRequest;
      const { permalink } = req.params;
      const { color } = req.body;
      if (!color) return res.status(400).json({ msg: 'Missing required parameter: color!' });
      const tiktak = await Tiktak.findOne({ permalink: `/governance/tiktak/${permalink}` });
      if (!tiktak) return res.status(400).json({ msg: 'There is no a tiktak with this id!' });
      await tiktakapis.finalVideo(tiktak, 1080, 1920, color);
      return;
      res.status(201).json(tiktak);
    } catch (err) {
      catchErrorCtrl(err, res);
    }
  },
  delete: async (userRequest: Request, res: Response) => {
    try {
      const req = userRequest as UserRequest;
      const { permalink } = req.params;
      const tiktak = await Tiktak.findOne({ permalink: `/governance/tiktak/${permalink}` });
      if (!tiktak) return res.status(400).json({ msg: 'There is no a tiktak with this id!' });
      const { video, background_video }: { video?: string; background_video?: string } = req.body;
      if (video) {
        tiktak.video = undefined;
        tiktak.images = [];
        tiktak.audios = [];
      }
      if (background_video) {
        tiktak.audio = undefined;
        tiktak.duration = undefined;
        tiktak.background_video = undefined;
      }
      await tiktak.save();
      res.status(200).json(true);
    } catch (err) {
      catchErrorCtrl(err, res);
    }
  },
  send: async (userRequest: Request, res: Response) => {
    try {
      const req = userRequest as UserRequest;
      const { permalink } = req.params;
      const tiktak = await Tiktak.findOne({ permalink: `/governance/tiktak/${permalink}` });
      if (!tiktak || !tiktak.video) return res.status(400).json({ msg: 'There is no a tiktak with this id!' });
      await telegramapis.sendVideo(apiconfig.telegram.logs_group_id, coraline.media.getPathFromUrl(tiktak.video), {
        width: 1080,
        height: 1920,
      });
      res.status(200).json({ msg: 'Video successfully sent to telegram chat' });
    } catch (err) {
      catchErrorCtrl(err, res);
    }
  },
};

export default tiktakCtrl;
