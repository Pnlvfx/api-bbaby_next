import type { CookieOptions, Request, Response } from 'express';
import config from '../../config/config';
import User from '../../models/User';
import { login } from '../user/user-functions/userFunctions';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { catchErrorCtrl } from '../../coraline/cor-route/crlerror';
import userapis from '../../lib/userapis/userapis';

interface JwtPayload {
  email: string;
}

const oauthCtrl = {
  register: async (req: Request, res: Response) => {
    try {
      const { email, username, password, ipInfo } = req.body;
      const user = await userapis.newUser(email, username, password, ipInfo);
      login(user._id.toString(), res);
    } catch (err) {
      catchErrorCtrl(err, res);
    }
  },
  checkEmail: async (req: Request, res: Response) => {
    try {
      const { email } = req.body;
      if (!userapis.validateEmail(email)) return res.status(200).json({ status: false, msg: 'Not a valid email address' });
      const existingEmail = await User.findOne({ email });
      if (existingEmail) return res.status(400).json({ status: false, msg: 'This email already exist!' });
      res.status(200).json({ status: true, msg: 'Success' });
    } catch (err) {
      catchErrorCtrl(err, res);
    }
  },
  activateEmail: async (req: Request, res: Response) => {
    try {
      const { activation_token } = req.body;
      const { ACTIVATION_TOKEN_SECRET } = config;
      const user = jwt.verify(activation_token, ACTIVATION_TOKEN_SECRET) as JwtPayload;
      const check = await User.findOne({ email: user.email });
      if (check) return res.status(400).json({ msg: 'This email already exists' });
      res.json({ msg: 'Success' });
    } catch (err) {
      catchErrorCtrl(err, res);
    }
  },
  login: async (req: Request, res: Response) => {
    try {
      const { username, password } = req.body;
      const user = await User.findOne({ username: new RegExp(`^${username}$`, 'i') });
      if (user && user.username) {
        const passOk = bcrypt.compareSync(password, user.password);
        if (passOk) {
          login(user._id.toString(), res);
        } else {
          return res.status(422).json({ msg: 'Invalid username or password' });
        }
      } else {
        return res.status(422).json({ msg: 'Invalid username or password' });
      }
    } catch (err) {
      catchErrorCtrl(err, res);
    }
  },
  logout: async (req: Request, res: Response) => {
    try {
      if (req?.headers?.origin?.startsWith('http://192')) {
        res
          .clearCookie('token', {
            httpOnly: true,
          })
          .send();
      } else {
        const domain = userapis.getCookieDomain(config.CLIENT_URL);
        res
          .clearCookie('token', {
            httpOnly: true,
            domain,
            secure: true,
          })
          .send();
      }
    } catch (err) {
      catchErrorCtrl(err, res);
    }
  },
  googleLogin: async (req: Request, res: Response) => {
    try {
      const { tokenId, ipInfo } = req.body;
      const { GOOGLE_SECRET } = config;
      const url = `https://www.googleapis.com/oauth2/v3/tokeninfo?id_token=${tokenId}`;
      const response = await fetch(url, {
        method: 'GET',
      });
      if (!response.ok) return res.status(401).json({ msg: 'Invalid Google Token, please retry.' });
      const data = await response.json();
      const { email_verified, email, name, picture } = data;
      const password = email + GOOGLE_SECRET;
      const passwordHash = bcrypt.hashSync(password, 10);
      if (!email_verified) return res.status(400).json({ msg: 'Email verification failed.' });
      const user = await User.findOne({ email });
      if (user) {
        const match = bcrypt.compareSync(password, user.password);
        if (!match) return res.status(400).json({ msg: 'Password is incorrect.' });
        login(user._id.toString(), res);
      } else {
        const { country, countryCode, city, region, lat, lon } = ipInfo;
        const username = await name.replace(/\s/g, '');
        const _user = new User({
          username,
          email,
          password: passwordHash,
          avatar: picture,
          country,
          countryCode,
          city,
          region,
          lat,
          lon,
        });
        await _user.save();
        login(_user._id.toString(), res);
      }
    } catch (err) {
      if (err instanceof Error) res.status(500).json({ msg: err.message });
    }
  },
  saveEUCookie: async (req: Request, res: Response) => {
    try {
      if (!req.headers.origin) return res.status(400).json({ msg: 'API enabled only for valid client!' });
      const { eu_cookie } = req.cookies;
      if (eu_cookie) return res.status(200).json(null);
      const maxAge = 63072000000 / 2; // 1 year
      const cookieOptions: CookieOptions = {
        maxAge,
        httpOnly: true,
        sameSite: true,
      };
      if (!req?.headers?.origin?.startsWith('http://192.168')) {
        cookieOptions.domain = userapis.getCookieDomain(config.CLIENT_URL);
        cookieOptions.secure = true;
      }
      const { status } = req.body;
      const value = `{%22nonessential:${status}%2C%22opted:true}`;
      res.status(201).cookie('eu_cookie', value, cookieOptions).json(true);
    } catch (err) {
      catchErrorCtrl(err, res);
    }
  },
  getEUCookie: async (req: Request, res: Response) => {
    try {
      const { eu_cookie } = req.cookies;
      res.status(200).json(eu_cookie ? true : false);
    } catch (err) {
      catchErrorCtrl(err, res);
    }
  },
};
export default oauthCtrl;
