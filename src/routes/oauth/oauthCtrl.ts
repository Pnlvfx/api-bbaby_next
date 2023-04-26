import type { CookieOptions, Request, Response } from 'express';
import config from '../../config/config';
import User from '../../models/User';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { catchErrorCtrl } from '../../coraline/cor-route/crlerror';
import userapis from '../../lib/userapis/userapis';
import { UserRequest } from '../../@types/express';
import sendEMail from '../user/user-functions/sendEmail';
import { IUser } from '../../models/types/user';
import cloudinary from '../../config/cloudinary';
import coraline from '../../coraline/coraline';

interface JwtPayload {
  _doc: IUser;
}

const oauthCtrl = {
  register: async (req: Request, res: Response) => {
    try {
      const { email, username, password, ipInfo } = req.body;
      const user = await userapis.newUser(email, username, password, ipInfo);
      userapis.login(user._id.toString(), res);
    } catch (err) {
      catchErrorCtrl(err, res);
    }
  },
  activateEmail: async (req: Request, res: Response) => {
    try {
      const { activation_token } = req.body;
      const { ACTIVATION_TOKEN_SECRET } = config;
      const jwtuser = jwt.verify(activation_token, ACTIVATION_TOKEN_SECRET) as JwtPayload;
      const user = await User.findOne({ email: jwtuser._doc.email });
      if (!user) return res.status(400).json({ msg: 'Something went wrong!' });
      user.email_verified = true;
      await user.save();
      res.status(200).json({ msg: 'Success' });
    } catch (err) {
      catchErrorCtrl(err, res);
    }
  },
  login: async (req: Request, res: Response) => {
    try {
      const { username, password } = req.body;
      const user = await User.findOne({ username: coraline.regex.upperLowerCase(username) });
      if (!user) return res.status(422).json({ msg: 'Invalid username!' });
      const passOk = bcrypt.compareSync(password, user.password);
      if (!passOk) return res.status(422).json({ msg: 'Invalid username or password' });
      userapis.login(user._id.toString(), res);
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
      if (!response.ok) return res.status(401).json({ msg: 'Invalid Google token, please retry.' });
      const data = await response.json();
      const { email_verified, email, name, picture } = data;
      if (!email_verified) return res.status(400).json({ msg: 'Email verification failed.' });
      const password = email + GOOGLE_SECRET;
      const passwordHash = bcrypt.hashSync(password, 10);
      let user = await User.findOne({ email });
      if (user) {
        const match = bcrypt.compareSync(password, user.password);
        if (!match) return res.status(400).json({ msg: 'Password is incorrect.' });
      } else {
        const { country, countryCode, city, region, lat, lon } = ipInfo;
        const avatar = await cloudinary.v2.uploader.upload(picture, {
          upload_preset: 'bbaby_avatar',
        });
        const username = await name.replace(/\s/g, '');
        user = new User({
          username,
          email,
          password: passwordHash,
          avatar: avatar.secure_url,
          country,
          countryCode,
          city,
          region,
          lat,
          lon,
        });
        await user.save();
      }
      userapis.login(user._id.toString(), res);
    } catch (err) {
      catchErrorCtrl(err, res);
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
  sendVerificationEmail: async (userRequest: Request, res: Response) => {
    try {
      const req = userRequest as UserRequest;
      const { user } = req;
      if (user.email_verified) return res.status(200).json({ msg: 'This email is already verified, try to refresh the page!' });
      const activation_token = userapis.createActivationToken(user);
      const url = `${config.CLIENT_URL}/verification/${activation_token}`;
      sendEMail(user.email, url, 'Verify Email Address', user);
      res.status(200).json({
        msg: `Bbabystyle sent a confimation email to: ${user.email}. Click the verify link in the email to secure your Bbabystyle account!`,
      });
    } catch (err) {
      catchErrorCtrl(err, res);
    }
  },
};
export default oauthCtrl;
