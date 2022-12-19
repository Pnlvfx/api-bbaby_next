import type { Request,Response } from 'express';
import type{ UserRequest } from "../../@types/express";
import config from '../../config/config';
import coraline from '../../coraline/coraline';
import { catchError, catchErrorCtrl } from '../../lib/common';
import redditapis from '../../lib/redditapis/redditapis';
import User from '../../models/User';

const USER_AGENT = `bbabysyle/1.0.0 (www.bbabytyle.com)`;

const redditCtrl = {
    redditLogin: async (expressRequest: Request,res: Response) => {
        try {
            const req = expressRequest as UserRequest;
            const {user} = req;
            const {REDDIT_CLIENT_ID,REDDIT_CLIENT_SECRET} = config;
            const { origin } = req.headers;
            if (!origin) return res.status(400).json({msg: "Make sure to access this API from www.bbabystyle.com"})
            if (!origin.includes('www.bbabystyle.com')) return res.status(400).json({msg: "Make sure to access this API from www.bbabystyle.com"})
            const { code } = req.query;
            if (!code) return res.status(500).json({msg: 'No code find!'});
            const encondedHeader = Buffer.from(`${REDDIT_CLIENT_ID}:${REDDIT_CLIENT_SECRET}`).toString("base64")
            let response = await fetch(`https://www.reddit.com/api/v1/access_token`, {
                method: 'POST',
                body: `grant_type=authorization_code&code=${code}&redirect_uri=${origin}/settings`,
                headers: {
                    authorization: 
                    `Basic ${encondedHeader}`,
                    'Content-Type': 'application/x-www-form-urlencoded', 
                    'User-Agent': USER_AGENT
                }
            });
            if (!response.ok) return res.status(500).json({msg: "For some reason reddit have refused your credentials. Please try to contact reddit support."})
            let body = await response.json()
            const access_token_expiration = coraline.addHours(1);
            const saveToken = await User.findOneAndUpdate({username: user.username}, {$push: {tokens: {access_token: body.access_token, refresh_token: body.refresh_token, provider: 'reddit', access_token_expiration}}})
            if (!saveToken) return res.status(500).json({msg: "Something went wrong, please try again"})
            response = await fetch(`https://oauth.reddit.com/api/v1/me`, {
                method: 'GET',
                headers: {authorization: `bearer ${body.access_token}`, 'User-Agent': USER_AGENT}
            })
            let redditUser = await response.json()
            const {verified,name,icon_img} = redditUser
            if(!verified) return res.status(400).json({msg: "You need to verify your Reddit account to continue!"})
            const updateUser = await User.findOneAndUpdate({username: user.username}, {$push: {externalAccounts: {username: name, provider: 'reddit'}}, hasExternalAccount: true})
            if (!updateUser) return res.status(500).json({msg: 'Something went wrong, please try again.'})
            res.status(200).json({msg: true})
        } catch (err) {
            if (err instanceof Error)
            res.status(500).json({msg: err.message})
        }
    },
    redditLogout: async (expressRequest: Request,res: Response) => {
        try {
            const req = expressRequest as UserRequest;
            const {user} = req
            const oauth_token = await User.findOneAndUpdate({username: user.username}, {$pull: {tokens: {provider: 'reddit'}, 'externalAccounts': {provider: 'reddit'}}})
            if (!oauth_token) return res.status(403).json({msg: "Missing, invalid, or expired tokens"})
            res.status(200).json({success:true})
        } catch (err) {
            if (err instanceof Error)
            res.status(403).json({msg: err.message})
        }
    },
    redditPostsWithToken: async (expressRequest: Request,res: Response) => {
        try {
            const req = expressRequest as UserRequest;
            const {user} = req;
            const {after, count} = req.query;
            const now = new Date();
            const redditTokens = user?.tokens?.find(provider => provider.provider === 'reddit');
            if (!redditTokens) return res.status(500).json({msg: 'You are not authorized to see this content.'})
            if (!redditTokens.access_token_expiration) return res.status(500).json({msg: 'You are not authorized to see this content.'})
            const registrationDate = new Date(redditTokens.access_token_expiration);
            if (now >= registrationDate) {
                const token = await redditapis.getNewToken(redditTokens);
            }
            const posts = await redditapis.getPosts(after?.toString(), count?.toString(), redditTokens.access_token as string);
            res.status(200).json(posts)
        } catch (err) {
            catchErrorCtrl(err, res);
        }
    },
    getRedditPosts: async (expressRequest: Request, res: Response) => {
        try {
            const response = await fetch('https://api.reddit.com', {
            method: 'get'
            })
            if (!response.ok) {
                const text = await response.text();
                res.status(400).json({msg: text});
            }
            const data = await response.json();
            res.status(200).json(data);
        } catch (err) {
            catchErrorCtrl(err, res)
        }
    },
    getRedditPostsFromCommunity: async (expressRequest: Request, res: Response) => {
        try {
            const response = await fetch('https://api.reddit.com/r/bbabystyle', {
            method: 'get'
            })
            if (!response.ok) {
                const text = await response.text();
                res.status(400).json({msg: text});
            }
            const data = await response.json();
            res.status(200).json(data);
        } catch (err) {
            catchErrorCtrl(err, res)
        }
    }
}

export default redditCtrl;
