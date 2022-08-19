import express from 'express'
import config from '../../../config/config'
import {google} from 'googleapis'
import bcrypt from 'bcrypt'
import User from '../../../models/User'
import { login } from './userFunctions'

const {OAuth2} = google.auth
const {MAILING_SERVICE_CLIENT_ID,GOOGLE_SECRET} = config
const client = new OAuth2()

export const _googleLogin = async(tokenId: string,req:express.Request,res:express.Response) => {
        const verify:any = await client.verifyIdToken({idToken: tokenId, audience: MAILING_SERVICE_CLIENT_ID})
        const {email_verified,email,name,picture} = verify.payload
        const password = email + GOOGLE_SECRET
        const passwordHash = bcrypt.hashSync(password, 10)
        if (!email_verified) return res.status(400).json({msg: "Email verification failed."})
        const user = await User.findOne({email})
        if (user) {
            const match = bcrypt.compareSync(password,user?.password)
            if(!match) return res.status(400).json({msg: "Password is incorrect."})
            login(user,res)
        } else {
            const {country,countryCode,city,region,lat,lon} = req.body.data
            const username = await name.replace(/\s/g,'')
            const _user = new User({
                username:username,email,password:passwordHash,avatar:picture,country,countryCode,city,region,lat,lon
            })
            await _user.save()
            login(_user,res)
        }
}