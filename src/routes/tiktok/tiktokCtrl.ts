import { Request, Response } from 'express';
import { catchErrorCtrl } from '../../coraline/cor-route/crlerror';
import tiktokapis from '../../lib/tiktokapis/tiktokapis';
import coraline from '../../coraline/coraline';
const infoPath = coraline.use('tiktok');

const tiktokCtrl = {
  downloadVideo: async (req: Request, res: Response) => {
    try {
      const { url } = req.query;
      if (!url) return res.status(400).json({ msg: "Missing required params: 'url'" });
      const id = tiktokapis.getVideoID(url.toString());
      const output = `${infoPath}/${id}`;
      const tiktok = await tiktokapis.downloadVideo(url.toString(), output);
      const text = await tiktokapis.extractText(tiktok.video.filename, tiktok.id);
      (tiktok as TiktokProps).text = text;
      await coraline.saveFile(output, tiktok);
      res.status(200).json(tiktok);
    } catch (err) {
      catchErrorCtrl(err, res);
    }
  },
  createVideo: async (req: Request, res: Response) => {
    try {
      const { text } = req.body;
      const { id } = req.params;
      const file = `${infoPath}/${id}`;
      try {
        const tiktok = await coraline.readJSON(file);
        tiktok.text = text;
        await coraline.saveFile(file, tiktok);
        res.status(200).json(true);
      } catch (err) {
        return res.status(400).json({ msg: "This tiktok doesn't exist!" });
      }
    } catch (err) {
      catchErrorCtrl(err, res);
    }
  },
  getTiktok: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const file = `${infoPath}/${id}`;
      console.log(file);
    } catch (err) {
      catchErrorCtrl(err, res);
    }
  },
};

export default tiktokCtrl;
