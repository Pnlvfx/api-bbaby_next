import { Request, Response } from 'express';
import coraline from '../../coraline/coraline';
import { catchErrorCtrl } from '../../coraline/cor-route/crlerror';
import { getUserFromToken } from '../user/user-functions/userFunctions';

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
      const { token } = req.cookies;
      const userIp = req.socket.remoteAddress?.split(':').pop();
      const user = token ? await getUserFromToken(token) : null;
      if (req.useragent?.isBot) {
        coraline.sendLog(`New bot: ${req.useragent?.source}`);
      } else {
        coraline.sendLog(`New session: ${user?.username || 'unknown user'}, Useragent: ${req.useragent?.source}, ip: ${userIp}`);
      }
      res.sendStatus(200);
    } catch (err) {
      catchErrorCtrl(err, res);
    }
  },
};

export default analyticsCtrl;
