import express from 'express'
import config from '../../config/config'
import { getUserFromToken } from '../user/user-functions/userFunctions'
import _oauth from '../../lib/twitter_oauth'
import User from '../../models/User'

const {COOKIE_DOMAIN,CLIENT_URL} = config
const oauthCallback = `${CLIENT_URL}/settings` //redirect
const oauth = _oauth(oauthCallback)
const COOKIE_NAME = 'oauth_token'
let tokens:any = {}

const TwitterCtrl = {
    twitterReqToken: async (req:express.Request,res:express.Response) => {
        try {
            const token = req.cookies.token ? req.cookies.token : null
            if (!token) return res.status(500).json({msg: "You need to create an account first"})
            const user = await getUserFromToken(token)
            const {oauth_token,oauth_token_secret} = await oauth.getOAuthRequestToken();
            res.cookie(COOKIE_NAME, oauth_token, {
                maxAge: 15 * 60 * 1000, // 15 minutes
                secure: true,
                httpOnly: true,
                sameSite: true,
                domain: COOKIE_DOMAIN
            })
            tokens[oauth_token] = {oauth_token_secret}
            res.status(200).json({oauth_token})
        } catch (err) {
            res.status(403).json({msg: err})
        }
    },
    twitterAccessToken: async (req:express.Request,res:express.Response) => {
        try {
            const {token} = req.cookies
            const user = await getUserFromToken(token)
            const {oauth_token: req_oauth_token,oauth_verifier} = req.body
            const oauth_token = req.cookies[COOKIE_NAME]
            const oauth_token_secret = tokens[oauth_token].oauth_token_secret
            if (oauth_token !== req_oauth_token) {
                return res.status(403).json({msg: 'Request token do not match'})
            }
            const {oauth_access_token, oauth_access_token_secret} = await oauth.getOauthAccessToken(oauth_token,oauth_token_secret,oauth_verifier)

            const saveTokens = await User.findOneAndUpdate({username: user?.username}, {$push: {tokens: {oauth_access_token: oauth_access_token, oauth_access_token_secret: oauth_access_token_secret, provider: 'twitter'}}})
            if (!saveTokens) return res.status(500).json({msg: 'Something went wrong in bbaby database'})
            res.status(200).json({success: true})
        } catch (err) {
            if (err instanceof Error)
            res.status(403).json({message: err.message});
        }
    },
    twitterUserInfo: async (req:express.Request,res:express.Response) => {
        try {
            const {token} = req.cookies
            const internalUser = await getUserFromToken(token)
            const twitter = internalUser?.tokens?.find((provider) => provider.provider === 'twitter')
            const {oauth_access_token, oauth_access_token_secret} = twitter
            const response = await oauth.getProtectedResource(`https://api.twitter.com/1.1/account/verify_credentials.json`, 'GET',oauth_access_token,oauth_access_token_secret)
            const user = JSON.parse(response.data)
            const info = await User.findOneAndUpdate({username: internalUser?.username}, {$push: {externalAccounts: {username: user.screen_name, provider: 'twitter', link: `https://www.twitter.com/${user.screen_name}`}}, hasExternalAccount: true})
            if (!info) return res.status(500).json({msg: 'Something went wrong in bbaby database'})
            res.json(JSON.parse(response.data))
        } catch (error) {
            res.status(403).json({message: error});
        }
    },
    twitterLogout: async (req:express.Request,res:express.Response) => {
        try {
            const token = req.cookies.token ? req.cookies.token : null
            if (!token) return res.status(500).json({msg: `You need to login first`})
            const user = await getUserFromToken(token)
            const oauth_token = await User.findOneAndUpdate({username: user?.username}, {$pull: {tokens: {provider: 'twitter'}, 'externalAccounts': {provider: 'twitter'}}})
            if (!oauth_token) return res.status(403).json({msg: "Missing, invalid, or expired tokens"})
            res.status(200).json({success:true})
        } catch (err) {
            if (err instanceof Error)
            res.status(403).json({msg: err.message})
        }
    },
    twitterGetUserPost: async (req:express.Request,res:express.Response) => {
        try {
            const token = req.cookies.token ? req.cookies.token : null
            if (!token) return res.status(500).json({msg: "You need to login first"})
            const user = await getUserFromToken(token)
            const twitter = user?.tokens?.find((provider) => provider.provider === 'twitter')
            const {oauth_access_token,oauth_access_token_secret} = twitter
            const {slug,owner_screen_name} = req.query
            const response = await oauth.getProtectedResource(`https://api.twitter.com/1.1/lists/statuses.json?slug=${slug}&owner_screen_name=${owner_screen_name}&tweet_mode=extended&count=100`,'GET',oauth_access_token,oauth_access_token_secret)
            res.json(JSON.parse(response.data))
        } catch (error) {
            res.status(403).json({message: error});
        }
    },
}

export default TwitterCtrl