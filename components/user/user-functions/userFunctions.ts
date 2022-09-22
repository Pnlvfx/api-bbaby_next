import {Response} from 'express';
import jwt from 'jsonwebtoken';
import config from '../../../config/config';
import User from '../../../models/User';

const {SECRET, COOKIE_DOMAIN, ACTIVATION_TOKEN_SECRET, NODE_ENV} = config;

export const getUserFromToken = async(token: string) => {
    const verify:any = jwt.verify(token, SECRET);
    const user = await User.findById(verify.id);
    return user
}

export const createActivationToken = ({...payload}) => {
    return jwt.sign(payload, ACTIVATION_TOKEN_SECRET, {expiresIn: '3d'})
}

export const validateEmail = (email: string) => {
    const re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email); 
}

export const login = (id: string, res: Response) => {
    jwt.sign({id} , SECRET, (err: any, token: any) => {
        if (err) throw new Error('For some reason you are able to login. Please retry.');
        if (NODE_ENV === 'development') {
            res.cookie('token', token, {
                httpOnly: true,
                maxAge: 63072000000
            }).json({msg: 'Successfully logged in!'})
        } else {
            res.cookie('token', token, {
                httpOnly: true,
                domain: COOKIE_DOMAIN,
                secure: true,
                maxAge: 63072000000
            }).json({msg: 'Successfully logged in!'})
        }
    });
}