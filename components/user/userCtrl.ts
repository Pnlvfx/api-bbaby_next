import express from 'express'
import config from '../../config/config'
import User from '../../models/User'
import { createActivationToken, getUserFromToken, login, validateEmail } from './user-functions/userFunctions'
import bcrypt from 'bcrypt'
import sendEMail from './user-functions/sendMail'
import jwt from 'jsonwebtoken'
import cloudinary from '../../lib/cloudinary'
import { _googleLogin } from './user-functions/google'

const userCtrl = {
    register: async (req:express.Request,res:express.Response) => {
        try {
            const {email,username,password,country,countryCode,city,region,lat,lon} = req.body
            if (!username || !email || !password)
            return res.status(400).json({msg: "Please fill in all fields"})

            if(!validateEmail(email))
            return res.status(400).json({msg: "That email is invalid"})

            const existingEmail = await User.findOne({email})
            if(existingEmail) return res.status(400).json({msg: "This email already exist!"})

            if(password.length < 8)
            return res.status(400).json({msg: "Password must be at least 8 characters long."})

            const passwordHash = bcrypt.hashSync(password, 10)

            const existingUser = await User.findOne({username})
            if (existingUser) return res.status(400).json( {msg: "This username already exist!"})

            const user = new User({email,username,password:passwordHash,country,countryCode,city,region,lat,lon})
            const activation_token = createActivationToken(user)
            const url = `${config.CLIENT_URL}/activation/${activation_token}`
            sendEMail(email,url,"Verify your email address")
            const savedUser = await user.save()
            login(savedUser,res)
        } catch (err) {
            if (err instanceof Error)
            res.status(500).json({msg: err.message})
        }
    },
    activateEmail: async (req:express.Request,res:express.Response) => {
        try {
            const {activation_token} = req.body
            const user:any = jwt.verify(activation_token, config.ACTIVATION_TOKEN_SECRET)
            const {email} = user
            const check = await User.findOne({email})
            if (check) return res.status(400).json({msg: "This email already exists"})
            res.json({msg: "Success"})
        } catch (err) {
            if (err instanceof Error)
            res.status(500).json({msg: err.message})
        }
    },
    login: async (req:express.Request,res:express.Response) => {
        try {
            const {username,password} = req.body
            const user = await User.findOne({username: new RegExp(`^${username}$`, 'i')})
            if (user && user.username) {
                const passOk = bcrypt.compareSync(password,user.password)
                if (passOk) {
                    login(user,res)
                } else {
                    return res.status(422).json({msg:'Invalid username or password'});
                }
            } else {
                return res.status(422).json({msg:'Invalid username or password'});
            }
        } catch (err) {
            if (err instanceof Error)
            res.status(500).json({msg: err.message})
        }
    },
    user: async (req:express.Request,res:express.Response) => {
        try {
            if (!req?.cookies?.token) {
                return res.json(null)
            } else {
                const {token} = req.cookies
                const user = await getUserFromToken(token)
                if (!user) {
                    return res.status(500).json({msg: 'Token expired'})
                } else {
                    res.json({user: {username:user.username, avatar: user.avatar, role: user.role}})
                }
            }
        } catch (err) {
            if (err instanceof Error)
            res.status(500).json({msg: err.message})
        }
    },
    userInfo: async (req:express.Request,res:express.Response) => {
        try {
            const token = req.cookies?.token ? req.cookies.token : null
            if (!token) return res.status(400).json({msg: 'You need to login first'})
            const user = await getUserFromToken(token)
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
    changeAvatar: async (req:express.Request,res:express.Response) => {
        try {
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
    forgotPassword: async (req:express.Request,res:express.Response) => {
        try {
            const {email} = req.body
            const user = await User.findOne({email})
            if (!user) return res.status(400).json({msg:"This email does not exist."})
        } catch (err) {
            if (err instanceof Error)
            res.status(500).json({msg: err.message})
        }
    },
    logout: async (req:express.Request,res:express.Response) => {
        try {
            const {COOKIE_DOMAIN} = config
            res.clearCookie('token',{
                httpOnly: true,
                domain: COOKIE_DOMAIN,
                secure: true
            }).send()
        } catch (err) {
            if (err instanceof Error)
            res.status(500).json({msg: "Cannot proceed to logout, please retry"})
        }
    },
    googleLogin: async (req:express.Request,res:express.Response) => {
        try {
            const {tokenId} = req.body
             _googleLogin(tokenId,req,res)
        } catch (err) {
            if (err instanceof Error)
            res.status(500).json({msg: err.message})
        }
    },
    redditLogin: async (req:express.Request,res:express.Response) => {
        try {
            const token = req.cookies.token ? req.cookies.token : null
            if (!token) return res.status(500).json({msg: "You need to login first"})
            const user = await getUserFromToken(token)
            const {REDDIT_CLIENT_ID,REDDIT_CLIENT_SECRET,CLIENT_URL} = config
            const {code} = req.query
            const encondedHeader = Buffer.from(`${REDDIT_CLIENT_ID}:${REDDIT_CLIENT_SECRET}`).toString("base64")
            let response = await fetch(`https://www.reddit.com/api/v1/access_token`, {
                method: 'POST',
                body: `grant_type=authorization_code&code=${code}&redirect_uri=${CLIENT_URL}/settings`,
                headers: {authorization: `Basic ${encondedHeader}`, 'Content-Type': 'application/x-www-form-urlencoded'}
            })
            let body = await response.json()
            const saveToken = await User.findOneAndUpdate({username: user.username}, {$push: {tokens: {access_token: body.access_token, refresh_token: body.refresh_token, provider: 'reddit'}}})
            if (!saveToken) return res.status(500).json({msg: "Something went wrong, please try again"})
            response = await fetch(`https://oauth.reddit.com/api/v1/me`, {
                method: 'GET',
                headers: {authorization: `bearer ${body.access_token}`}
            })
            let redditUser = await response.json()
            const {verified,name,icon_img} = redditUser
            if(!verified) return res.status(400).json({msg: "You need to verify your Reddit account to continue!"})
            const updateUser = await User.findOneAndUpdate({username: user?.username}, {$push: {externalAccounts: {username: name, provider: 'reddit'}}})
            if (!updateUser) return res.status(500).json({msg: 'Something went wrong, please try again.'})
            res.status(200).json({msg: true})
        } catch (err) {
            if (err instanceof Error)
            res.status(500).json({msg: err.message})
        }
    }
}

export default userCtrl
