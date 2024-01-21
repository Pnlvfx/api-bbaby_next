import sendEmail from '../../routes/user/user-functions/send-email';
import config from '../../config/config';
import User from '../../models/user';
import bcrypt from 'bcrypt';
import { UserIpInfoProps } from './types';
import jwt from 'jsonwebtoken';
import { CookieOptions, Response } from 'express';
import coraline from 'coraline';
const maxAge = 63_072_000_000;

interface JwtPayload {
  id: string;
}

const userapis = {
  getUserFromToken: (token: string) => {
    const verify = jwt.verify(token, config.SECRET) as JwtPayload;
    return User.findById(verify.id);
  },
  getIP: async (ip?: string) => {
    let url = 'https://extreme-ip-lookup.com/json';
    if (ip) {
      url += '/' + ip;
    }
    url += `?key=${config.IP_LOOKUP_API_KEY}`;
    const res = await fetch(url, {
      method: 'get',
    });
    const userIpInfo = await res.json();
    if (!res.ok) throw new Error('Error when trying to get ip info!');
    return userIpInfo as UserIpInfoProps;
  },
  validateEmail: (email: string) => {
    const re = /^(([^\s"(),.:;<>@[\\\]]+(\.[^\s"(),.:;<>@[\\\]]+)*)|(".+"))@((\[(?:\d{1,3}\.){3}\d{1,3}])|(([\dA-Za-z-]+\.)+[A-Za-z]{2,}))$/;
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
  newUser: async (origin: string, email: string, username: string, password: string, IPinfo?: UserIpInfoProps) => {
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
    const url = `${origin}/verification/${activation_token}`;
    sendEmail(email, url, 'Verify Email Address', user);
    await user.save();
    return user;
  },
  login: (id: string, origin: string, res: Response) => {
    const token = jwt.sign({ id }, config.SECRET);
    const cookieOptions: CookieOptions = {
      httpOnly: true,
      maxAge,
    };
    if (!origin.startsWith('http://192')) {
      const domain = userapis.getCookieDomain(origin);
      cookieOptions.domain = domain;
      cookieOptions.secure = true;
    }
    res.cookie('token', token, cookieOptions).json({ msg: 'Successfully logged in!' });
  },
};

export default userapis;
