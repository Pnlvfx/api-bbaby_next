/* eslint-disable sonarjs/cognitive-complexity */
import type { Request, Response } from 'express';
import userapis from '../../lib/userapis/userapis';
import { catchErrorCtrl, sendLog as sendlog } from '../../lib/telegram';

const analyticsCtrl = {
  sendLog: async (req: Request, res: Response) => {
    try {
      const { message } = req.query;
      if (!message) return res.status(400).json({ msg: 'Missing required parameter!' });
      await sendlog(message.toString());
      res.status(200).json('ok');
    } catch (err) {
      catchErrorCtrl(err, res);
    }
  },
  pageview: async (req: Request, res: Response) => {
    try {
      const { token } = req.cookies;
      const userIp = req.headers['x-forwarded-for'];
      const user = token ? await userapis.getUserFromToken(token) : undefined;
      if (user?.role === 1) return res.sendStatus(200);
      if (!req.useragent) return res.sendStatus(200);
      if (!req.headers.origin) return res.sendStatus(200);
      if (req.useragent.isBot) return res.sendStatus(200);
      if (req.useragent.source.match('Ahrefs')) return res.sendStatus(200);
      if (req.useragent.source.match('Chrome-Lighthouse')) return res.sendStatus(200);
      if (req.useragent.source.match('Googlebot')) return res.sendStatus(200);
      if (req.useragent.source.match('BingPreview')) return res.sendStatus(200);
      if (userIp) {
        const ip = Array.isArray(userIp) ? userIp[0] : userIp;
        const userInfo = await userapis.getIP(ip);
        await sendlog(
          `${req.headers.origin} New session: ${user?.username || 'unknown user'}, Country: ${userInfo.country}, City: ${userInfo.city}, Browser: ${
            req.useragent.browser
          } Platform: ${req.useragent.platform}, useragent: ${req.useragent.source}`,
        );
      } else {
        await sendlog(`${req.headers.origin} New session: ${user?.username || 'unknown user'}, Useragent: ${req.useragent?.source}, ip: ${userIp}`);
      }
      res.sendStatus(200);
    } catch (err) {
      catchErrorCtrl(err, res);
    }
  },
};

export default analyticsCtrl;
