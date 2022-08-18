import config from '../../../config/config'
import express from 'express'
import TelegramBot from 'node-telegram-bot-api'
import {TwitterApi} from 'twitter-api-v2';
import { IUser } from '../../../@types/user';

const telegramToken = config.TELEGRAM_TOKEN
const bot = new TelegramBot(telegramToken)

export const sharePostToTelegram = async(savedPost:any,res:express.Response) => {
    const chat_id = savedPost.community === 'Italy' ? '@anonynewsitaly' : savedPost.community === 'calciomercato' ? '@bbabystyle1' : '@bbaby_style'
    const my_text = `https://bbabystyle.com/b/${savedPost.community}/comments/${savedPost._id}`
    const message = await bot.sendMessage(chat_id, my_text)
    if(!message) {
        return res.status(500).json({msg: "Something went wrong during the upload on telegram"})
    }
}

export const _sharePostToTwitter = async(user:IUser,savedPost:any,res:express.Response) => {
    const {TWITTER_CONSUMER_KEY,TWITTER_CONSUMER_SECRET,ANON_ACCESS_TOKEN,ANON_ACCESS_TOKEN_SECRET,BBABYITALIA_ACCESS_TOKEN,BBABYITALIA_ACCESS_TOKEN_SECRET,BBABY_ACCESS_TOKEN,BBABY_ACCESS_TOKEN_SECRET} = config
    const twitter = user?.tokens?.find((provider) => provider.provider === 'twitter')
    if (!twitter) return res.status(500).json({msg: "You need to authorize the twitter API into the User Settings page."})
    const {oauth_access_token, oauth_access_token_secret} = twitter
    if (!oauth_access_token && oauth_access_token_secret) {
        return res.status(500).json({msg:'You need to access to your twitter account first'})
    }
    const {role} = user
    const twitterClient = new TwitterApi({
        appKey: TWITTER_CONSUMER_KEY,
        appSecret: TWITTER_CONSUMER_SECRET,
        accessToken: role === 0 ? oauth_access_token : savedPost.community === 'Italy' ? ANON_ACCESS_TOKEN : savedPost.community === 'calciomercato' ? BBABYITALIA_ACCESS_TOKEN : BBABY_ACCESS_TOKEN,
        accessSecret: role === 0 ? oauth_access_token_secret : savedPost.community === 'Italy' ? ANON_ACCESS_TOKEN_SECRET : savedPost.community === 'calciomercato' ? BBABYITALIA_ACCESS_TOKEN_SECRET : BBABY_ACCESS_TOKEN_SECRET,
    });
    const response = await twitterClient.v1.tweet(`bbabystyle.com/b/${savedPost.community}/comments/${savedPost._id}`)
        if (!response) return res.status(500).json({msg: "Something went wrong during the upload on twitter"})
}