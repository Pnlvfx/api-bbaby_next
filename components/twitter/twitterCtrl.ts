import type { Request, Response } from 'express';
import type { UserRequest } from '../../@types/express';
import config from '../../config/config';
import { catchErrorCtrl } from '../../lib/common';
import _oauth from '../../lib/twitter_oauth';
import User from '../../models/User';

const {COOKIE_DOMAIN, CLIENT_URL, ANON_ACCESS_TOKEN, ANON_ACCESS_TOKEN_SECRET} = config;
const oauthCallback = `${CLIENT_URL}/settings`; //redirect
const oauth = _oauth(oauthCallback)
const COOKIE_NAME = 'oauth_token'
let tokens:any = {}

const TwitterCtrl = {
    twitterReqToken: async (expressRequest: Request,res: Response) => {
        try {
            const req = expressRequest as UserRequest;
            console.log('ok');
            const {oauth_token, oauth_token_secret} = await oauth.getOAuthRequestToken();
            if (!oauth_token) return res.status(500).json({msg: 'Twitter error.'})
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
    twitterAccessToken: async (expressRequest: Request,res: Response) => {
        try {
            const req = expressRequest as UserRequest;
            const {user} = req
            const {oauth_token: req_oauth_token,oauth_verifier} = req.body;
            const oauth_token = req.cookies[COOKIE_NAME]
            const oauth_token_secret = tokens[oauth_token].oauth_token_secret
            if (oauth_token !== req_oauth_token) {
                return res.status(403).json({msg: 'Request token do not match'})
            }
            const {oauth_access_token, oauth_access_token_secret} = await oauth.getOauthAccessToken(oauth_token,oauth_token_secret,oauth_verifier)
            const saveTokens = await User.findOneAndUpdate({username: user.username}, {$push: {tokens: {oauth_access_token: oauth_access_token, oauth_access_token_secret: oauth_access_token_secret, provider: 'twitter'}}})
            if (!saveTokens) return res.status(500).json({msg: 'Something went wrong in bbaby database'})
            res.status(200).json({success: true})
        } catch (err) {
            if (err instanceof Error)
            res.status(403).json({message: err.message});
        }
    },
    twitterUserInfo: async (expressRequest: Request,res: Response) => {
        try {
            const req = expressRequest as UserRequest;
            const internalUser = req.user
            const twitter = internalUser?.tokens?.find((provider) => provider.provider === 'twitter');
            if (!twitter) return res.status(500).json({msg: "Sorry. We can't find your twitter account. Have you associated it in your User Settings page?"});
            const {oauth_access_token, oauth_access_token_secret} = twitter
            if (!oauth_access_token || !oauth_access_token_secret) return res.status(500).json({msg: "Please, try to login to twitter again!"})
            const response = await oauth.getProtectedResource(`https://api.twitter.com/1.1/account/verify_credentials.json`, 'GET', oauth_access_token, oauth_access_token_secret)
            const user = JSON.parse(response.data)
            const info = await User.findOneAndUpdate({username: internalUser?.username}, {$push: {externalAccounts: {username: user.screen_name, provider: 'twitter', link: `https://www.twitter.com/${user.screen_name}`}}, hasExternalAccount: true})
            if (!info) return res.status(500).json({msg: 'Something went wrong in bbaby database'})
            res.json(JSON.parse(response.data))
        } catch (error) {
            res.status(403).json({message: error});
        }
    },
    twitterLogout: async (expressRequest: Request,res: Response) => {
        try {
            const req = expressRequest as UserRequest;
            const {user} = req;
            const oauth_token = await User.findOneAndUpdate({username: user?.username}, {$pull: {tokens: {provider: 'twitter'}, 'externalAccounts': {provider: 'twitter'}}})
            if (!oauth_token) return res.status(403).json({msg: "Missing, invalid, or expired tokens"})
            res.status(200).json({success:true})
        } catch (err) {
            if (err instanceof Error)
            res.status(403).json({msg: err.message})
        }
    },
    twitterGetUserPost: async (expressRequest: Request,res: Response) => {
        try {
            const req = expressRequest as UserRequest;
            const {user} = req;
            const twitter = user.tokens?.find((provider) => provider.provider === 'twitter');
            if (!twitter) return res.status(401).json({msg: 'You need to connect your twitter account to access this page!'})
            const {oauth_access_token,oauth_access_token_secret} = twitter;
            if (!oauth_access_token || !oauth_access_token_secret) return res.status(400).json({msg: "Please, try to login to twitter again!"})
            const {slug,owner_screen_name} = req.query;
            if (! slug || !owner_screen_name) return res.status(400).json({msg: 'This API require a slug parameter and an owner_screen_name.'})
            const response = await oauth.getProtectedResource(`https://api.twitter.com/1.1/lists/statuses.json?slug=${slug}&owner_screen_name=${owner_screen_name}&tweet_mode=extended&count=100`,'GET', oauth_access_token, oauth_access_token_secret);
            const data = JSON.parse(response.data);
            if (!Array.isArray(data)) return res.status(500).json({msg: "Invalid response from twitter!"})
            res.json(data);
        } catch (error) {
            console.log(error);
            res.status(403).json({message: error});
        }
    },
    getHome: async (expressRequest: Request,res: Response) => {
        try {
            const req = expressRequest as UserRequest;
            const {user} = req;
            const twitter = user.tokens?.find((provider) => provider.provider === 'twitter');
            if (!twitter) return res.status(401).json({msg: 'You need to connect your twitter account to access this page!'})
            const {oauth_access_token,oauth_access_token_secret} = twitter;
            if (!oauth_access_token || !oauth_access_token_secret) return res.status(400).json({msg: "Please, try to login to twitter again!"});
            const url = 'https://api.twitter.com/1.1/statuses/home_timeline.json?tweet_mode=extended&count=100'
            const response = await oauth.getProtectedResource(url,'GET', ANON_ACCESS_TOKEN, ANON_ACCESS_TOKEN_SECRET);
            const data = JSON.parse(response.data)
            if (!Array.isArray(data)) return res.status(500).json({msg: "Invalid response from twitter!"})
            res.json(data);
        } catch (err) {
            catchErrorCtrl(err, res);
        }
    }
}

export default TwitterCtrl;
