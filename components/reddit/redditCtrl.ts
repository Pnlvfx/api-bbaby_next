import type { Request,Response } from 'express';
import type{ UserRequest } from "../../@types/express";
import config from '../../config/config';
import coraline from '../../database/coraline';
import { catchError, catchErrorCtrl } from '../../lib/common';
import User from '../../models/User';

const {CLIENT_URL} = config;
const USER_AGENT = `bbabysyle/1.0.0 (${CLIENT_URL})`;

const redditCtrl = {
    redditLogin: async (expressRequest:Request,res:Response) => {
        try {
            const req = expressRequest as UserRequest;
            const {user} = req;
            const {REDDIT_CLIENT_ID,REDDIT_CLIENT_SECRET} = config;
            const {code} = req.query;
            if (!code) return res.status(500).json({msg: 'No code find!'});
            const encondedHeader = Buffer.from(`${REDDIT_CLIENT_ID}:${REDDIT_CLIENT_SECRET}`).toString("base64")
            let response = await fetch(`https://www.reddit.com/api/v1/access_token`, {
                method: 'POST',
                body: `grant_type=authorization_code&code=${code}&redirect_uri=${CLIENT_URL}/settings`,
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
    redditLogout: async (expressRequest:Request,res:Response) => {
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
    redditPostsWithToken: async (expressRequest:Request,res:Response) => {
        try {
            const req = expressRequest as UserRequest;
            const {user} = req;
            const {after, count} = req.query;
            const now = new Date();
            const {REDDIT_CLIENT_ID,REDDIT_CLIENT_SECRET} = config;
            const redditTokens = user?.tokens?.find(provider => provider.provider === 'reddit');
            if (!redditTokens) return res.status(500).json({msg: 'You are not authorized to see this content.'})
            const {access_token_expiration} = redditTokens;
            if (!access_token_expiration) return res.status(500).json({msg: 'You are not authorized to see this content.'})
            const getRefreshToken = async () => {
                try {
                    const encondedHeader = Buffer.from(`${REDDIT_CLIENT_ID}:${REDDIT_CLIENT_SECRET}`).toString("base64");
                    const response = await fetch(`https://www.reddit.com/api/v1/access_token`, {
                        method: 'POST',
                        body: `grant_type=refresh_token&refresh_token=${redditTokens.refresh_token}`,
                        headers: {authorization: `Basic ${encondedHeader}`, 'Content-Type': 'application/x-www-form-urlencoded'}
                    });
                    if (!response.ok) return res.status(500).json({msg: "For some reason reddit have refused your credentials. Please try to contact reddit support."})
                    const body = await response.json()
                    const date = new Date()
                    const expiration = coraline.addHours(1, date);
                    const deletePrevTokens = await User.findOneAndUpdate({username: user.username}, {$pull: {tokens: {provider: 'reddit'}}})
                    const saveNewToken = await User.findOneAndUpdate({
                        username: user.username}, 
                        {$push: 
                            {
                                tokens: 
                                {
                                    access_token: body.access_token, 
                                    refresh_token: body.refresh_token, 
                                    provider: 'reddit', 
                                    access_token_expiration: expiration
                                }
                            }})
                            return 'ok';
                } catch (err) {
                    catchError(err);
                }
            }
            const getRedditPosts = async () => {
                try {
                    const url = `https://oauth.reddit.com/best?sr_detail=true`
                    const query = after ? `after=${after}&count=${count}` : null
                    const finalUrl = query ? `${url}&${query}` : url;
                    console.log(finalUrl);
                    const response = await fetch(finalUrl, {
                        method: 'get',
                        headers: {authorization: `bearer ${redditTokens.access_token}`, 'User-Agent': USER_AGENT}
                    })
                    if (!response.ok) {
                        const error = await response.text();
                        return res.status(500).json({msg: error})
                    } else {
                        const posts = await response.json();
                        return posts;
                    }                    
                } catch (err) {
                    catchError(err);
                }
            }
            const registrationDate = new Date(access_token_expiration);
            if (now >= registrationDate) {
                const token = await getRefreshToken();
            }
            const posts = await getRedditPosts();
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
                catchError(text);
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
                catchError(text);
            }
            const data = await response.json();
            res.status(200).json(data);
        } catch (err) {
            catchErrorCtrl(err, res)
        }
    }
}

export default redditCtrl;
