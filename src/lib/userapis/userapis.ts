import { Request } from 'express';
import sendEMail from '../../components/user/user-functions/sendMail';
import { createActivationToken } from '../../components/user/user-functions/userFunctions';
import config from '../../config/config';
import { catchError } from '../../coraline/cor-route/crlerror';
import User from '../../models/User';
import bcrypt from 'bcrypt';

const userapis = {
  getIP: (req: Request) => {
    const xForwardedFor = req.headers['x-forwarded-for']
    const clientIp = xForwardedFor && xForwardedFor.length > 0 ? xForwardedFor[0] : req.connection.remoteAddress;
    if (!clientIp) throw new Error('Missing client IP for this user!')
    return clientIp
  },
  getIPinfo: async (clientIp?: string) => {
    try {
      let url = `https://extreme-ip-lookup.com/json`;
      if (clientIp) {
        url += `/${clientIp}`
      }
      url += `?key=${config.IP_LOOKUP_API_KEY}`
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
      /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
  },
  newUser: async (email: string, username: string, password: string, req?: Request) => {
    try {
      let clientIp
      if (req) {
        clientIp = userapis.getIP(req)
      }
      const { country, countryCode, city, region, lat, lon } = await userapis.getIPinfo(clientIp);
      if (!username || !email || !password) throw new Error('Please fill in all fields!');
      if (!userapis.validateEmail(email)) throw new Error('Not a valid email address!');
      const existingEmail = await User.findOne({ email });
      if (existingEmail) throw new Error('This email already exist!');
      if (password.length < 8) throw new Error('Password must be at least 8 characters long.');
      const passwordHash = bcrypt.hashSync(password, 10);

      const existingUser = await User.findOne({ username });
      if (existingUser) throw new Error('This username already exist!');

      const user = new User({
        email,
        username,
        password: passwordHash,
        country,
        countryCode,
        city,
        region,
        lat,
        lon,
      });
      const activation_token = createActivationToken(user);
      const url = `${config.CLIENT_URL}/activation/${activation_token}`;
      sendEMail(email, url, 'Verify your email address');
      await user.save();
      return user;
    } catch (err) {
      throw catchError(err);
    }
  },
  getCookieDomain: (url: string) => {
    const hostname = new URL(url).hostname;
    const domain = hostname.split('.').slice(-2).join('.');
    if (domain === 'localhost') return domain
    return `.${domain}`;
  },
};

export default userapis;
