import sendEmail from '../../routes/user/user-functions/sendEmail';
import config from '../../config/config';
import { catchError } from '../../coraline/cor-route/crlerror';
import User from '../../models/User';
import bcrypt from 'bcrypt';
import { UserIpInfoProps } from './types';
import coraline from '../../coraline/coraline';
import jwt from 'jsonwebtoken';
import { CookieOptions, Response } from 'express';
const maxAge = 63072000000;

interface JwtPayload {
  id: string;
}

const userapis = {
  getUserFromToken: async (token: string) => {
    try {
      const verify = jwt.verify(token, config.SECRET) as JwtPayload;
      const user = await User.findById(verify.id);
      return user;
    } catch (err) {
      throw catchError(err);
    }
  },
  getIP: async (ip?: string) => {
    try {
      let url = 'https://extreme-ip-lookup.com/json';
      if (ip) {
        url += '/' + ip;
      }
      url += `?key=${config.IP_LOOKUP_API_KEY}`;
      const res = await fetch(url, {
        method: 'get',
      });
      const userIpInfo = await res.json();
      if (!res.ok) throw new Error(userIpInfo?.msg);
      return userIpInfo as UserIpInfoProps;
    } catch (err) {
      throw catchError(err);
    }
  },
  validateEmail: (email: string) => {
    const re =
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
  },
  getCookieDomain: (url: string) => {
    const domain = new URL(url).hostname.split('.').slice(-2).join('.');
    if (domain === 'localhost') return domain;
    return `.${domain}`;
  },
  createActivationToken: ({ ...payload }) => {
    return jwt.sign(payload, config.ACTIVATION_TOKEN_SECRET, { expiresIn: '3d' });
  },
  newUser: async (email: string, username: string, password: string, IPinfo?: UserIpInfoProps) => {
    try {
      if (!username || !email || !password) throw new Error('Please fill in all fields!');
      if (!userapis.validateEmail(email)) throw new Error('Not a valid email address!');
      if (password.length < 8) throw new Error('Password must be at least 8 characters long.');
      const passwordHash = bcrypt.hashSync(password, 10);
      const existingEmail = await User.findOne({ email });
      if (existingEmail) throw new Error('This email already exist!');
      const existingUser = await User.findOne({ username: coraline.regex.upperLowerCase(username) });
      if (existingUser) throw new Error('This username already exist!');
      const user = new User({
        email,
        username,
        password: passwordHash,
      });
      if (IPinfo) {
        user.country = IPinfo.country;
        user.countryCode = IPinfo.countryCode;
        user.city = IPinfo.city;
        user.region = IPinfo.region;
        user.lat = IPinfo.lat;
        user.lon = IPinfo.lon;
      }
      const activation_token = userapis.createActivationToken(user);
      const url = `${config.CLIENT_URL}/verification/${activation_token}`;
      sendEmail(email, url, 'Verify Email Address', user);
      await user.save();
      return user;
    } catch (err) {
      throw catchError(err);
    }
  },
  login: (id: string, res: Response) => {
    const token = jwt.sign({ id }, config.SECRET);
    const cookieOptions: CookieOptions = {
      httpOnly: true,
      maxAge,
    };
    if (!config.CLIENT_URL.startsWith('http://192')) {
      const domain = userapis.getCookieDomain(config.CLIENT_URL);
      cookieOptions.domain = domain;
      cookieOptions.secure = true;
    }
    res.cookie('token', token, cookieOptions).json({ msg: 'Successfully logged in!' });
  },
  clearToken: (res: Response, mobile?: boolean) => {
    const cookieOptions: CookieOptions = {
      httpOnly: true,
      maxAge,
    };
    if (!config.CLIENT_URL.startsWith('http://192')) {
      const domain = userapis.getCookieDomain(config.CLIENT_URL);
      cookieOptions.domain = domain;
      cookieOptions.secure = true;
    }
    res.clearCookie('token', cookieOptions).json({
      user: null,
      device: {
        mobile,
      },
    });
  },
};

export default userapis;
