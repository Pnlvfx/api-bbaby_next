import type { Request, Response } from 'express';
import type { UserRequest } from '../../@types/express';
import User from '../../models/User';
import { getUserFromToken } from './user-functions/userFunctions';
import cloudinary from '../../config/cloudinary';
import { catchErrorCtrl } from '../../coraline/cor-route/crlerror';
import userapis from '../../lib/userapis/userapis';
import config from '../../config/config';
import coraline from '../../coraline/coraline';

const userCtrl = {
  user: async (req: Request, res: Response) => {
    try {
      const { token } = req.cookies;
      const { useragent } = req;
      const mobile = useragent?.isMobile;
      if (!token)
        return res.status(200).json({
          user: null,
          device: {
            mobile,
          },
        });
      const user = await getUserFromToken(token);
      if (!user) {
        if (req?.headers?.origin?.startsWith('http://192')) {
          res
            .clearCookie('token', {
              httpOnly: true,
            })
            .json({
              user: null,
              device: {
                mobile,
              },
            });
        } else {
          const domain = userapis.getCookieDomain(config.CLIENT_URL);
          res
            .clearCookie('token', {
              httpOnly: true,
              domain,
              secure: true,
            })
            .json({
              user: null,
              device: {
                mobile,
              },
            });
        }
      } else {
        res.status(200).json({
          user: {
            username: user.username,
            avatar: user.avatar,
            role: user.role,
            email_verified: user.email_verified,
          },
          device: {
            mobile,
          },
        });
      }
    } catch (err) {
      catchErrorCtrl(err, res);
    }
  },
  userFromUsername: async (req: Request, res: Response) => {
    try {
      const { username } = req.params;
      const user = await User.findOne({ username: coraline.mongo.regexUpperLowerCase(username) });
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
      const { user } = req;
      const { image } = req.body;
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
