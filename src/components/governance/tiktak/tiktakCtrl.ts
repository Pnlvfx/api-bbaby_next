import { Request, Response } from 'express';
import { catchErrorCtrl } from '../../../coraline/cor-route/crlerror';
import { UserRequest } from '../../../@types/express';
import openaiapis from '../../../lib/openaiapis/openaiapis';
import googleapis from '../../../lib/googleapis/googleapis';
import Tiktak from '../../../models/Tiktak';
import coraline from '../../../coraline/coraline';
import tiktokapis from '../../../lib/tiktokapis/tiktokapis';
import { catchErrorWithTelegram } from '../../../config/common';

const tiktakCtrl = {
  newTiktak: async (userRequest: Request, res: Response) => {
    try {
      const req = userRequest as UserRequest;
      const { text } = req.body;
      if (!text) return res.status(400).json({ msg: 'Please add your text to the input.' });
      const { lang } = req.query;
      if (!lang) return res.status(400).json({ msg: 'Add the source language in your query url.' });
      const to = lang.toString() === 'en' ? 'it' : 'en';
      const exist = await Tiktak.findOne({ original_body: text });
      if (exist) return res.status(200).json(exist);
      const permalink = `/governance/tiktak/${coraline.createPermalink(text)}`;
      const exist2 = await Tiktak.findOne({ permalink });
      if (exist2) return res.status(200).json(exist2);
      let translation;
      try {
        translation = await openaiapis.translate(text, lang.toString(), to);
      } catch (err) {
        translation = await googleapis.translate(text, lang.toString(), to);
      }
      const synthetize = await openaiapis.synthetize(text);
      const tiktak = new Tiktak({
        original_body: text,
        body: translation,
        permalink,
        magick_word: synthetize,
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
      res.status(200).json({ tiktak });
    } catch (err) {
      catchErrorCtrl(err, res);
    }
  },
  createTiktak: async (userRequest: Request, res: Response) => {
    try {
      const req = userRequest as UserRequest;
      const { permalink } = req.query;
      const { text, synthetize } = req.body;
      if (!text) return res.status(400).json({ msg: 'Missing required parameter: text' });
      const tiktak = await Tiktak.findOne({ permalink });
      if (!tiktak) return res.status(400).json({ msg: 'This tiktak does not exist!' });
      if (synthetize) {
        tiktak.synthetize = synthetize;
      }
      tiktak.body = text;
      await tiktak.save();
      await tiktokapis.quoraVideo(tiktak, 1080, 1920);
      res.status(201).json(tiktak);
    } catch (err) {
      catchErrorWithTelegram(err);
      catchErrorCtrl(err, res);
    }
  },
};

export default tiktakCtrl;
