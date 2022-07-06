import express from 'express'
import { getUserFromToken } from './userFunctions'

const userCtrl = {
    register: async (req:express.Request,res:express.Response) => {

    },
    activateEmail: async (req:express.Request,res:express.Response) => {

    },
    login: async (req:express.Request,res:express.Response) => {

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
        } catch (err) {
            
        }
    },
}

export default userCtrl