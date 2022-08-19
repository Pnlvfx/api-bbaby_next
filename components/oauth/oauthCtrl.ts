import type { Request, Response } from "express";
import config from '../../config/config';
import User from "../../models/User";
import { createActivationToken, login, validateEmail } from "../user/user-functions/userFunctions";
import bcrypt from 'bcrypt';
import sendEMail from "../user/user-functions/sendMail";
import jwt from 'jsonwebtoken';
import { _googleLogin } from "../user/user-functions/google";

const {CLIENT_URL,NODE_ENV} = config;

const oauthCtrl = {
    register: async (req:Request,res:Response) => {
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

            const user = new User({email,username,password:passwordHash,country,countryCode,city,region,lat,lon})
            const activation_token = createActivationToken(user)
            const url = `${CLIENT_URL}/activation/${activation_token}`
            sendEMail(email,url,"Verify your email address")
            const savedUser = await user.save()
            login(savedUser,res)
        } catch (err) {
            if (err instanceof Error)
            res.status(500).json({msg: err.message})
        }
    },
    activateEmail: async (req:Request,res:Response) => {
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
    login: async (req:Request,res:Response) => {
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
    logout: async (req:Request,res:Response) => {
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
    googleLogin: async (req:Request,res:Response) => {
        try {
            const {tokenId} = req.body;
             _googleLogin(tokenId,req,res)
        } catch (err) {
            if (err instanceof Error)
            res.status(500).json({msg: err.message})
        }
    },
}
export default oauthCtrl;
