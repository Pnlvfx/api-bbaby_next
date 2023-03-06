import jwt from 'jsonwebtoken';
import coraline from '../../../coraline/coraline';
import { GoogleCredentials } from '../types/credentials';
import { catchError } from '../../../coraline/cor-route/crlerror';

type TokenType = 'translate' | 'text_to_speech' | 'youtube' | 'speech_to_text';

const requestNew = async (type: TokenType) => {
  try {
    const SCOPES = [
      'https://www.googleapis.com/auth/cloud-platform',
      'https://www.googleapis.com/auth/cloud-translation',
      'https://www.googleapis.com/auth/youtube.upload',
    ];
    const path = coraline.use('private_key');
    const file = `${path}/bbabystyle_googleCredentials.json`;
    const service_account = await coraline.readJSON(file);
    const { private_key, client_email, private_key_id } = service_account;
    const scope = type === 'text_to_speech' || type === 'speech_to_text' ? SCOPES[0] : type === 'translate' ? SCOPES[1] : SCOPES[2];
    const token = jwt.sign(
      {
        iss: client_email,
        scope,
        aud: 'https://oauth2.googleapis.com/token',
      },
      private_key,
      {
        algorithm: 'RS256',
        expiresIn: '3600s',
        header: {
          alg: 'RS256',
          typ: 'JWT',
          kid: private_key_id,
        },
      },
    );
    const query = new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: token,
    }).toString();
    const res = await fetch(`https://oauth2.googleapis.com/token?${query}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data?.error);
    if (data.expires_in) {
      data.expires = Date.now() + data.expires_in * 1000;
    }
    const access_token_folder = coraline.use('token');
    const access_token = `${access_token_folder}/${type}_token.json`;
    await coraline.saveFile(access_token, data);
    return data;
  } catch (err) {
    throw catchError(err);
  }
};

const serviceAccount = {
  getAccessToken: async (type: TokenType) => {
    try {
      const folder = coraline.use('token');
      const access_token = `${folder}/${type}_token.json`;
      let credentials: GoogleCredentials;
      try {
        credentials = await coraline.readJSON(access_token);
        if (credentials.expires && Date.now() > credentials.expires) {
          credentials = await requestNew(type);
        }
      } catch (err) {
        credentials = await requestNew(type);
      }
      return credentials;
    } catch (err) {
      throw catchError(err);
    }
  },
};

export default serviceAccount;
