import type {Request, Response} from 'express';
import type { UserRequest } from '../../@types/express';
import User from '../../models/User';
import { getUserFromToken } from './user-functions/userFunctions';
import cloudinary from '../../lib/cloudinary';
import { _googleLogin } from './user-functions/google';
import telegramapis from '../../lib/telegramapis';
import { catchErrorCtrl } from '../../lib/common';

const userCtrl = {
    user: async (req:Request,res:Response) => {
        try {
            const {token} = req.cookies;
            if (!token) return res.status(200).json(null);
            const user = await getUserFromToken(token);
            if (!user) {
                res.json(null)
            } else {
                res.status(200).json({user: {
                    username:user.username, 
                    avatar: user.avatar, 
                    role: user.role}
                })
            }
        } catch (err) {
            if (err instanceof Error)
            res.status(500).json({msg: err.message})
        }
    },
    userInfo: async (expressRequest:Request,res:Response) => {
        try {
            const req = expressRequest as UserRequest;
            const {user} = req;
            res.json({
                avatar: user?.avatar,
                country: user?.country, 
                email:user?.email,
                externalAccounts:user?.externalAccounts,
                hasExternalAccount: user?.hasExternalAccount,
                role: user?.role,
                username: user?.username
            })
        } catch (err) {
            if (err instanceof Error)
            res.status(500).json({msg: err.message})
        }
    },
    changeAvatar: async (expressRequest:Request,res:Response) => {
        try {
            const req = expressRequest as UserRequest;
            const {user} = req;
            const {image,username} = req.body
            const uploadedImage = await cloudinary.v2.uploader.upload(image, {
                upload_preset: 'bbaby_avatar'
            })
            if (!uploadedImage) return res.status(500).json({msg: 'Something went wrong with this image, please try again or change type of image'})
            const _changeAvatar = await User.findOneAndUpdate({username: username}, {avatar: uploadedImage.secure_url})
            if (!_changeAvatar) return res.status(500).json({msg: 'Something went wrong with this image, please try again or change type of image'})
            res.json({success: "Avatar updated successfully"})
        } catch (err) {
            if (err instanceof Error)
            res.status(500).json({msg: err.message})
        }
    },
    forgotPassword: async (expressRequest:Request,res:Response) => {
        try {
            const req = expressRequest as UserRequest;
        } catch (err) {
            if (err instanceof Error)
            res.status(500).json({msg: err.message})
        }
    },
    analytics: async (req:Request,res: Response) => {
        try {
            const {token} = req.cookies;
            const user = token ? await getUserFromToken(token) : null
            // const req = expressRequest as UserRequest;
            // const {SESSION_TRACKER, COOKIE_DOMAIN} = config;
            // res.cookie('session_tracker', SESSION_TRACKER, {
            //     domain: COOKIE_DOMAIN,
            //     path: '/',
            // }).send();
            console.log(user);
            telegramapis.sendLog(`New session: ${user ? user.username : 'unknown user'}` + ' ' + 'Useragent:' + req.useragent?.source + 'Ip:' + req.ips.toString())
            res.status(200).json('ok')
        } catch (err) {
            catchErrorCtrl(err, res);
        }
    },

}

export default userCtrl;

