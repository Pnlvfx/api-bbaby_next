import type { Request, Response } from 'express';
import type { UserRequest } from '../../@types/express';
import User from '../../models/user';
import cloudinary from '../../config/cloudinary';
import userapis from '../../lib/userapis/userapis';
import coraline from 'coraline';
import { catchErrorCtrl } from '../../lib/telegram';

const userCtrl = {
  user: async (req: Request, res: Response) => {
    try {
      const { token } = req.cookies;
      if (!token) {
        return res.status(200).json({
          user: null,
        });
      }
      const user = await userapis.getUserFromToken(token);
      if (user) {
        res.status(200).json({
          user: {
            username: user.username,
            avatar: user.avatar,
            role: user.role,
            email_verified: user.email_verified,
          },
        });
      } else {
        return res.status(200).json({
          user: null,
        });
      }
    } catch (err) {
      catchErrorCtrl(err, res);
    }
  },
  userFromUsername: async (req: Request, res: Response) => {
    try {
      const { username } = req.params;
      const user = await User.findOne({ username: coraline.regex.upperLowerCase(username) });
      if (!user) return res.status(400).json({ msg: "This user doens't exist" });
      const response = {
        avatar: user.avatar,
        country: user.country,
        email: user.email,
        email_verified: user.email_verified,
        externalAccounts: user.externalAccounts,
        hasExternalAccount: user.hasExternalAccount,
        role: user.role,
        username: user.username,
      };
      res.status(200).json(response);
    } catch (err) {
      catchErrorCtrl(err, res);
    }
  },
  userInfo: async (expressRequest: Request, res: Response) => {
    try {
      const req = expressRequest as UserRequest;
      const { user } = req;
      const response = {
        avatar: user.avatar,
        country: user.country,
        email: user.email,
        email_verified: user.email_verified,
        externalAccounts: user.externalAccounts,
        hasExternalAccount: user.hasExternalAccount,
        role: user.role,
        username: user.username,
      };
      res.status(200).json(response);
    } catch (err) {
      catchErrorCtrl(err, res);
    }
  },
  changeAvatar: async (expressRequest: Request, res: Response) => {
    try {
      const req = expressRequest as UserRequest;
      const { user, body } = req;
      const { image } = body;
      const uploadedImage = await cloudinary.v2.uploader.upload(image, {
        upload_preset: 'bbaby_avatar',
      });
      const _changeAvatar = await User.findOneAndUpdate({ username: user.username }, { avatar: uploadedImage.secure_url });
      if (!_changeAvatar) return res.status(500).json({ msg: 'Something went wrong with this image, please try again or change image' });
      res.json({ success: 'Avatar updated successfully' });
    } catch (err) {
      catchErrorCtrl(err, res);
    }
  },
  forgotPassword: async (expressRequest: Request, res: Response) => {
    try {
      //
    } catch (err) {
      if (err instanceof Error) res.status(500).json({ msg: err.message });
    }
  },
};

export default userCtrl;
