import type { Request, Response } from "express";
import config from '../../config/config';
import User from "../../models/User";
import { createActivationToken, login, validateEmail } from "../user/user-functions/userFunctions";
import bcrypt from 'bcrypt';
import sendEMail from "../user/user-functions/sendMail";
import jwt from 'jsonwebtoken';
import { catchErrorCtrl } from "../../lib/common";
import {google} from 'googleapis'

const {CLIENT_URL, NODE_ENV, COOKIE_DOMAIN} = config;

const oauthCtrl = {
    register: async (req: Request,res: Response) => {
        try {
            const {email,username,password,country,countryCode,city,region,lat,lon} = req.body;
            if (!username || !email || !password) return res.status(400).json({msg: "Please fill in all fields"})
            if(!validateEmail(email)) return res.status(400).json({msg: "That email is invalid"})
            const existingEmail = await User.findOne({email})
            if(existingEmail) return res.status(400).json({msg: "This email already exist!"})
            if(password.length < 8) return res.status(400).json({msg: "Password must be at least 8 characters long."})
            const passwordHash = bcrypt.hashSync(password, 10)

            const existingUser = await User.findOne({username})
            if (existingUser) return res.status(400).json( {msg: "This username already exist!"})

            const user = new User({
                email,
                username,
                password: passwordHash,
                country,
                countryCode,
                city,
                region,
                lat,
                lon
            })
            const activation_token = createActivationToken(user)
            const url = `${CLIENT_URL}/activation/${activation_token}`
            sendEMail(email,url,"Verify your email address")
            const savedUser = await user.save()
            login(user._id.toString(), res)
        } catch (err) {
            if (err instanceof Error)
            res.status(500).json({msg: err.message})
        }
    },
    activateEmail: async (req: Request,res: Response) => {
        try {
            const {activation_token} = req.body;
            const {ACTIVATION_TOKEN_SECRET} = config;
            const user:any = jwt.verify(activation_token, ACTIVATION_TOKEN_SECRET);

            const {email} = user
            const check = await User.findOne({email})
            if (check) return res.status(400).json({msg: "This email already exists"})
            res.json({msg: "Success"})
        } catch (err) {
            if (err instanceof Error)
            res.status(500).json({msg: err.message})
        }
    },
    login: async (req: Request,res: Response) => {
        try {
            const {username,password} = req.body
            const user = await User.findOne({username: new RegExp(`^${username}$`, 'i')})
            if (user && user.username) {
                const passOk = bcrypt.compareSync(password,user.password)
                if (passOk) {
                    login(user._id.toString() , res)
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
    logout: async (req: Request,res: Response) => {
        try {
            const {COOKIE_DOMAIN} = config
            if (NODE_ENV === 'development') {
                res.clearCookie('token',{
                    httpOnly: true,
                }).send()
            } else {
                res.clearCookie('token',{
                    httpOnly: true,
                    domain: COOKIE_DOMAIN,
                    secure: true
                }).send()
            }
        } catch (err) {
            if (err instanceof Error)
            res.status(500).json({msg: "Cannot proceed to logout, please retry"})
        }
    },
    googleLogin: async (req: Request,res: Response) => {
        try {
            const {tokenId} = req.body;
            const {OAuth2} = google.auth
            const {MAILING_SERVICE_CLIENT_ID,GOOGLE_SECRET} = config
            const client = new OAuth2()
            const verify: any = await client.verifyIdToken({idToken: tokenId, audience: MAILING_SERVICE_CLIENT_ID});
            const {email_verified, email, name, picture} = verify.payload
            const password = email + GOOGLE_SECRET;
            const passwordHash = bcrypt.hashSync(password, 10);
            if (!email_verified) return res.status(400).json({msg: "Email verification failed."})
            const user = await User.findOne({email})
            if (user) {
                const match = bcrypt.compareSync(password, user.password)
                if(!match) return res.status(400).json({msg: "Password is incorrect."})
                login(user._id.toString() , res)
            } else {
                const {country, countryCode, city, region, lat, lon} = req.body.data
                const username = await name.replace(/\s/g,'')
                const _user = new User({
                    username:username,email,password:passwordHash,avatar:picture,country,countryCode,city,region,lat,lon
                })
                await _user.save()
                login(_user._id.toString() , res)
            }
        } catch (err) {
            if (err instanceof Error)
            res.status(500).json({msg: err.message})
        }
    },
    eu_cookie : async (req: Request, res: Response) => {
        try {
            res.cookie('eu_cookie', '', {
                maxAge: 15 * 60 * 1000, // 15 minutes
                secure: true,
                httpOnly: true,
                sameSite: true,
                domain: COOKIE_DOMAIN
            })
        } catch (err) {
            catchErrorCtrl(err, res);
        }
    }
}
export default oauthCtrl;
