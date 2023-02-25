import { IncomingMessage } from 'http';
import config from '../../config/config';
import OAuth from 'oauth';

interface RequestToken {
  oauth_token: string;
  oauth_token_secret: string;
  results: {
    oauth_callback_confirmed: string;
  };
}

interface AccessToken {
  oauth_access_token: string;
  oauth_access_token_secret: string;
  results: {
    user_id: string;
    screen_name: string;
  };
}

interface getProtectedResource {
  data: string | Buffer;
  response: IncomingMessage | undefined;
}

export default (oauthCallback: string) => {
  const { TWITTER_CONSUMER_KEY, TWITTER_CONSUMER_SECRET } = config;
  const _oauth = new OAuth.OAuth(
    'https://api.twitter.com/oauth/request_token',
    'https://api.twitter.com/oauth/access_token',
    TWITTER_CONSUMER_KEY,
    TWITTER_CONSUMER_SECRET,
    '1.0',
    oauthCallback,
    'HMAC-SHA1',
  );

  const oauth = {
    getOAuthRequestToken: () => {
      return new Promise<RequestToken>((resolve, reject) => {
        _oauth.getOAuthRequestToken((error, oauth_token, oauth_token_secret, results) => {
          if (error) reject(error.data);
          resolve({ oauth_token, oauth_token_secret, results });
        });
      });
    },
    getOauthAccessToken: (oauth_token: string, oauth_token_secret: string, oauth_verifier: string) => {
      return new Promise<AccessToken>((resolve, reject) => {
        _oauth.getOAuthAccessToken(
          oauth_token,
          oauth_token_secret,
          oauth_verifier,
          (error, oauth_access_token, oauth_access_token_secret, results) => {
            if (error) reject(error.data);
            resolve({ oauth_access_token, oauth_access_token_secret, results });
          },
        );
      });
    },
    getProtectedResource: (url: string, method: string, oauth_access_token: string, oauth_access_token_secret: string) => {
      return new Promise<getProtectedResource>((resolve, reject) => {
        _oauth.getProtectedResource(url, method, oauth_access_token, oauth_access_token_secret, (error, data, response) => {
          if (error) reject(error.data);
          if (!data) return reject('API response is invalid');
          resolve({ data, response });
        });
      });
    },
  };
  return oauth;
};
