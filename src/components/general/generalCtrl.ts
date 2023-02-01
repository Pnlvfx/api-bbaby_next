import { Request, Response } from 'express';
import { catchErrorCtrl } from '../../coraline/cor-route/crlerror';
import openaiapis from '../../lib/openaiapis/openaiapis';

const generalCtrl = {
  generateImage: async (req: Request, res: Response) => {
    try {
      const { text } = req.query;
      if (!text) return res.status(400).json({ msg: 'Bad request, please insert the text parameter!' });
      const image = await openaiapis.generateImage(text?.toString(), 1);
      const data = {
        image: image[0].url,
        width: 1024,
        height: 1024,
      };
      res.status(201).json(data);
    } catch (err) {
      catchErrorCtrl(err, res);
    }
  },
};

export default generalCtrl;
