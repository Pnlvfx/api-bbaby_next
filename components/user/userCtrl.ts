import express from 'express'
import config from '../../config/config'
import User from '../../models/User'
import { createActivationToken, getUserFromToken, login, validateEmail } from './user-functions/userFunctions'
import bcrypt from 'bcrypt'
import sendEMail from './user-functions/sendMail'

const userCtrl = {
    register: async (req:express.Request,res:express.Response) => {
        try {
            const {email,username,password,country,countryCode,city,region,lat,lon} = req.body
            const {SECRET,COOKIE_DOMAIN} = config
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
        } catch (err:any) {
            res.status(500).json({msg: err.message})
        }
    },
    activateEmail: async (req:express.Request,res:express.Response) => {

    },
    login: async (req:express.Request,res:express.Response) => {
        try {
            const {username,password} = req.body
            const user = await User.findOne({username})
            if (user && user.username) {
                const passOk = bcrypt.compareSync(password,user.password)
                if (passOk) {
                    login(user,res)
                } else {
                    res.status(422).json({msg:'Invalid username or password'});
                }
            } else {
                res.status(422).json({msg:'Invalid username or password'});
            }
        } catch (err:any) {
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
                    res.status(500).json({msg: 'Token expired'})
                } else {
                    res.json({user: {username:user.username, avatar: user.avatar, role: user.role}})
                }
            }
        } catch (err:any) {
            res.status(500).json({msg: err.message})
        }
    },
}

export default userCtrl