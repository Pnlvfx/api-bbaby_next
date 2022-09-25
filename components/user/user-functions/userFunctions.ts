import {CookieOptions, Response} from 'express';
import jwt from 'jsonwebtoken';
import config from '../../../config/config';
import User from '../../../models/User';

const {SECRET, COOKIE_DOMAIN, ACTIVATION_TOKEN_SECRET, NODE_ENV} = config;

interface JwtPayload {
    id: string
}

export const getUserFromToken = async (token: string) => {
    try {
        const verify = jwt.verify(token, SECRET) as JwtPayload;
        const user = await User.findById(verify.id);
        return user
    } catch (err) {

    }
}

export const createActivationToken = ({...payload}) => {
    return jwt.sign(payload, ACTIVATION_TOKEN_SECRET, {expiresIn: '3d'})
}

export const validateEmail = (email: string) => {
    const re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email); 
}

export const login = (id: string, res: Response) => {
    const token = jwt.sign({id}, SECRET);
    const maxAge = 63072000000
    let cookieOptions: CookieOptions = {
        httpOnly: true,
        maxAge,
    }
    if (NODE_ENV === 'production') {
        cookieOptions.domain = COOKIE_DOMAIN
        cookieOptions.secure = true
    }
    res.cookie('token', token, cookieOptions).json({msg: 'Successfully logged in!'});
}