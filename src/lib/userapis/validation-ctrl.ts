import { Request, Response } from 'express';
import userapis from './userapis';
import User from '../../models/user';
import { catchErrorCtrl } from '../telegram';

const validationCtrl = {
  checkEmail: async (req: Request, res: Response) => {
    try {
      const { email }: { email?: string } = req.body;
      if (!email) return res.status(200).json({ status: false, msg: 'Please enter an email address to continue' });
      if (!userapis.validateEmail(email)) return res.status(200).json({ status: false, msg: 'Not a valid email address' });
      const existingEmail = await User.findOne({ email });
      if (existingEmail) return res.status(200).json({ status: false, msg: 'This email already exist!' });
      res.status(200).json({ status: true, msg: 'Success' });
    } catch (err) {
      catchErrorCtrl(err, res);
    }
  },
  checkUsername: async (req: Request, res: Response) => {
    try {
      const { username }: { username?: string } = req.body;
      if (!username || username.length < 3) return res.status(200).json({ status: false, msg: 'Username must be between 3 and 20 characters' });
      const existing = await User.findOne({ username });
      if (existing) return res.status(200).json({ status: false, msg: 'This username already exist!' });
      res.status(200).json({ status: true, msg: 'Success' });
    } catch (err) {
      catchErrorCtrl(err, res);
    }
  },
  checkPass: async (req: Request, res: Response) => {
    try {
      const { password }: { password?: string } = req.body;
      if (!password || password.length < 8) return res.status(200).json({ status: false, msg: 'Password must be at least 8 characters long' });
      res.status(200).json({ status: true, msg: 'Good one' });
    } catch (err) {
      catchErrorCtrl(err, res);
    }
  },
};

export default validationCtrl;
