import coraline from 'coraline';
import type { Request, Response } from 'express';
import fs from 'node:fs';
import { catchErrorCtrl } from '../../lib/telegram';

const imageCtrl = {
  route: async (req: Request, res: Response) => {
    try {
      const info = req.params.id;
      const { w, h } = req.query;
      const path = coraline.use('images');
      const _info = info.split('.');
      const image = w && h ? `${path}/news/${_info[0]}_1920x1080.${_info[1]}` : `${path}/news/${info}`;
      const headers = {
        'Content-Type': `image/${_info[1]}`,
        'Cache-Control': 'public, max-age=1309600, s-max-age=86400, must-revalidate',
      };
      res.writeHead(200, headers);
      const videoStream = fs.createReadStream(image);
      videoStream.pipe(res);
    } catch (err) {
      catchErrorCtrl(err, res);
    }
  },
};

export default imageCtrl;
