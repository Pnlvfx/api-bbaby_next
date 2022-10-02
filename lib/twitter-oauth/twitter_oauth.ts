import config from '../../config/config';
import OAuth from 'oauth';
import crypto from 'crypto';
import http from 'http';
import https from 'https';

interface RequestToken {
    oauth_token: string
    oauth_token_secret: string
    results: any
}

export default (oauthCallback: string) => {
    const { TWITTER_CONSUMER_KEY, TWITTER_CONSUMER_SECRET } = config
    const _oauth = new (OAuth.OAuth)(
        'https://api.twitter.com/oauth/request_token',
        'https://api.twitter.com/oauth/access_token',
        TWITTER_CONSUMER_KEY,
        TWITTER_CONSUMER_SECRET,
        '1.0',
        oauthCallback,
        'HMAC-SHA1'
    );

    const oauth = {
        getOAuthRequestToken: () => {
            return new Promise<RequestToken>((resolve, reject) => {
                _oauth.getOAuthRequestToken((error,oauth_token,oauth_token_secret,results) => {
                    if (error) reject(error)
                    resolve({oauth_token,oauth_token_secret, results})
                });
            });
        },
        getOAuthRequestToken2: () => {
            return new Promise<any>(async (resolve, reject) => {
                try {
                    const timestamp = Math.floor((new Date().getTime() / 1000));
                    const oauth_nonce = crypto.randomBytes(25).toString('hex');
                    const oauth_signature = crypto.randomBytes(20).toString('hex');
                    const callback = encodeURIComponent(oauthCallback)
                    const Authorization = `OAuth oauth_callback="${callback}",oauth_consumer_key="${TWITTER_CONSUMER_KEY}",oauth_nonce="${oauth_nonce}",oauth_signature="${oauth_signature}",oauth_signature_method="HMAC-SHA1",oauth_timestamp="${timestamp}",oauth_version="1.0"`
                    const headers = {
                        Authorization,
                        "Accept": "*/*",
                        "Connection" : "close",
                        "User-Agent": "Node authentication",
                        "Content-length": "0",
                        "Content-Type": "application/x-www-form-urlencoded",
                    }
                    const options = {
                        host: 'api.twitter.com',
                        port: 443,
                        path: '/oauth/request_token',
                        method: 'POST',
                        headers
                    }
                    const request = http.request(options);
                    console.log(request);
                    request.on('response', (response) => {
                        response.on('data', (data) => {
                            console.log(data);
                        })
                        response.on('error', (err) => {
                            console.log(err);
                        })
                    })
                } catch (err) {
                    console.log(err);
                }
            });
        },
        getOauthAccessToken: (oauth_token: string,oauth_token_secret: string,oauth_verifier: string) => {
            return new Promise<any>((resolve, reject) => {
                _oauth.getOAuthAccessToken(oauth_token,oauth_token_secret,oauth_verifier, (error,oauth_access_token,oauth_access_token_secret, results) => {
                    if (error) reject (error)
                    resolve({oauth_access_token,oauth_access_token_secret, results})
                });
            });
        },
        getProtectedResource: (url: string,method: string,oauth_access_token: string,oauth_access_token_secret: string) => {
            return new Promise<any>((resolve, reject) => {
                _oauth.getProtectedResource(url,method,oauth_access_token,oauth_access_token_secret, (error,data,response) => {
                    if (error) reject (error)
                    resolve({data, response})
                })
            })
        }
    };
    return oauth
}