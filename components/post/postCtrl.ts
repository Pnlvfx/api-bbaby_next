import express from 'express'
import config from '../../config/config'
import TelegramBot from 'node-telegram-bot-api'

const telegramToken = config.TELEGRAM_TOKEN
const bot = new TelegramBot(telegramToken)

const PostCtrl = {
    createPost: async (req:express.Request,res:express.Response) => {
         try {
            const {token} = req.cookies
            if (!token) {
                return res.status(401).json({msg: "You need to login first"})
            }
            
         } catch (err:any) {
            res.status(500).json({msg: err.message})
         }
    }
}

export default PostCtrl