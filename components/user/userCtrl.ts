import type {Request, Response} from 'express';
import type { UserRequest } from '../../@types/express';
import User from '../../models/User';
import { getUserFromToken } from './user-functions/userFunctions';
import cloudinary from '../../lib/cloudinary';
import { _googleLogin } from './user-functions/google';
import telegramapis from '../../lib/telegramapis';

const userCtrl = {
    user: async (req:Request,res:Response) => {
        try {
            const {token} = req.cookies;
            if (!token) return res.status(200).json(null);
            const user = await getUserFromToken(token);
            if (user?.role !== 1) telegramapis.sendLog(`New session: ${JSON.stringify(user)}`)
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
}

export default userCtrl;

