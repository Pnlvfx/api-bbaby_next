import fs from 'node:fs';
import { Request, Response } from 'express';
import coraline from 'coraline';
import { catchErrorCtrl } from '../lib/telegram';

const videoCtrl = {
  sendVideo: async (req: Request, res: Response) => {
    try {
      const fsPromises = fs.promises;
      const { range } = req.headers;
      if (!range) res.status(400).json('Requires range header');
      const path = coraline.use('videos');
      const video = `${path}/checco.mp4`;
      const videoStat = await fsPromises.stat(video);
      const videoSize = videoStat.size;
      const CHUNK_SIZE = 10 ** 6; //1mb
      const start = Number(range?.replace(/\D/g, ''));
      const end = Math.min(start + CHUNK_SIZE, videoSize - 1);
      const contentLength = end - start + 1;
      const headers = {
        'Content-range': `bytes ${start}-${end}/${videoSize}`,
        'Accept-ranges': 'bytes',
        'Content-length': contentLength,
        'Content-Type': 'video/mp4',
        'Cache-Control': 'public, max-age=1309600, s-max-age=86400, must-revalidate',
      };
      res.writeHead(206, headers);
      const videoStream = fs.createReadStream(video, { start, end });
      videoStream.pipe(res);
    } catch (err) {
      catchErrorCtrl(err, res);
    }
  },
};

export default videoCtrl;
