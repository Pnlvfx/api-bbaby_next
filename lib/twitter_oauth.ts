import config from '../config/config';
import OAuth from 'oauth';
import crypto from 'crypto';

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
                console.log(_oauth);
                _oauth.getOAuthRequestToken((error,oauth_token,oauth_token_secret,results) => {
                    if (error) reject(error)
                    resolve({oauth_token,oauth_token_secret, results})
                });
            });
        },
        getOAuthRequestToken2: () => {
            return new Promise<RequestToken>(async (resolve, reject) => {
                try {
                    const reqTokenUrl = `https://api.twitter.com/oauth/request_token?oauth_callback=${oauthCallback}`;
                    const timestamp = Math.floor((new Date().getTime() / 1000));
                    const oauth_nonce = crypto.randomBytes(48).toString('hex');
                    const authorization = `OAuth oauth_consumer_key="${TWITTER_CONSUMER_KEY}", oauth_nonce="${oauth_nonce}", oauth_signature="bbabystyle", oauth_signature_method="HMAC-SHA1", oauth_timestamp="${timestamp}", oauth_version="1.0"`
                    console.log(authorization)
                        
                    const headers = {
                        "Accept": '*/*',
                        "Content-Type": 'application/x-www-form-urlencoded',
                        "Authorization": authorization,
                        'User-Agent': 'Node authentication'
                    }
                    const res = await fetch(reqTokenUrl, {
                        method: 'POST',
                        headers,
                    })
                    console.log(res);
                    const data = await res.json();
                    console.log(res.ok);
                    if (!res.ok) {
                        const errors = res.status + res.statusText + data?.errors[0]?.message
                        console.log(errors);
                        reject(errors);
                    } else {
                        console.log(data);
                        resolve(data);
                    }
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