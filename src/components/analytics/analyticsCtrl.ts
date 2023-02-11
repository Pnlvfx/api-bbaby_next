import { Request, Response } from 'express';
import coraline from '../../coraline/coraline';
import { catchErrorCtrl } from '../../coraline/cor-route/crlerror';
import userapis from '../../lib/userapis/userapis';

const analyticsCtrl = {
  sendLog: async (req: Request, res: Response) => {
    try {
      const { message } = req.query;
      if (!message) return res.status(400).json({ msg: 'Missing required parameter!' });
      await coraline.sendLog(message.toString());
      res.status(200).json('ok');
    } catch (err) {
      catchErrorCtrl(err, res);
    }
  },
  pageview: async (req: Request, res: Response) => {
    try {
      const userIp = req.socket.remoteAddress;
      console.log(userIp);
      const info = await userapis.getIP(userIp);
      console.log(info);
    } catch (err) {
      catchErrorCtrl(err, res);
    }
  },
};

export default analyticsCtrl;
