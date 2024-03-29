import { Request, Response } from 'express';
import tiktokapis from '../../lib/tiktokapis/tiktokapis';
import { TextArray, Tiktok } from '../../lib/tiktokapis/types/tttypes';
import coraline from 'coraline';
import { catchErrorCtrl } from '../../lib/telegram';
const infoPath = coraline.use('tiktok');

const tiktokCtrl = {
  downloadVideo: async (req: Request, res: Response) => {
    try {
      const { url } = req.query;
      if (!url) return res.status(400).json({ msg: "Missing required params: 'url'" });
      const id = tiktokapis.getVideoID(url.toString());
      const output = `${infoPath}/${id}.json`;
      let tiktok: Tiktok;
      try {
        tiktok = await coraline.readJSON(output);
        if (!tiktok.video) {
          tiktok = await tiktokapis.directDownload(url.toString(), output);
        }
        if (!tiktok.text) {
          tiktok.text = await tiktokapis.extractText(tiktok.video.filename, tiktok.id);
        }
      } catch {
        tiktok = await tiktokapis.directDownload(url.toString(), output);
        tiktok.text = await tiktokapis.extractText(tiktok.video.filename, tiktok.id);
      }
      await coraline.saveFile(output, JSON.stringify(tiktok));
      res.status(200).json(tiktok);
    } catch (err) {
      catchErrorCtrl(err, res);
    }
  },
  getTiktok: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const file = `${infoPath}/${id}.json`;
      const tiktok = (await coraline.readJSON(file)) as Tiktok;
      res.status(200).json(tiktok);
    } catch (err) {
      catchErrorCtrl(err, res);
    }
  },
  save: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { text, translated, textArray }: { text: string; translated: string; textArray: TextArray[] } = req.body;
      const file = `${infoPath}/${id}.json`;
      const tiktok = (await coraline.readJSON(file)) as Tiktok;
      if (text) {
        tiktok.text = text;
      }
      if (translated) {
        tiktok.translated = translated;
        tiktok.textArray = [
          {
            text: translated,
            start: 0,
            end: 5,
          },
        ];
      }
      if (textArray) {
        tiktok.textArray = textArray;
      }
      await coraline.saveFile(file, JSON.stringify(tiktok));
      res.status(200).json(tiktok);
    } catch (err) {
      catchErrorCtrl(err, res);
    }
  },
  createVideo: async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const file = `${infoPath}/${id}.json`;
      try {
        const tiktok = (await coraline.readJSON(file)) as Tiktok;
        if (!tiktok.textArray) return res.status(400).json({ msg: 'Bad request' });
        // // const images = await Promise.all(
        // //   tiktok.textArray.map((arr) => {

        // //   }),
        // // );
        // // console.log(images);
        res.status(200).json(true);
      } catch {
        return res.status(400).json({ msg: "This tiktok doesn't exist!" });
      }
    } catch (err) {
      catchErrorCtrl(err, res);
    }
  },
};

export default tiktokCtrl;
