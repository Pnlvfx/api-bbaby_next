import { catchError } from "../common";
import jwt from 'jsonwebtoken';
import coraline from "../../database/coraline";

const serviceAccounts = {
     getAccessToken: async (type: 'translate' | 'text_to_speech') => {
        try {
            const SCOPES = [
                'https://www.googleapis.com/auth/cloud-platform',
                'https://www.googleapis.com/auth/cloud-translation',
                'https://www.googleapis.com/auth/youtube.upload'
            ]
            const path = coraline.use('private_key');
            const file = `${path}/bbabystyle_googleCredentials.json`;
            const service_account = await coraline.readJSON(file);
            const {private_key, client_email, private_key_id} = service_account;
            const scope = type === 'text_to_speech' ? SCOPES[0] : type === 'translate' ? SCOPES[1] : SCOPES[2];
            const token = jwt.sign({
                iss: client_email,
                scope,
                aud: "https://oauth2.googleapis.com/token",
            }, private_key, {
                algorithm: 'RS256',
                expiresIn: '3600s',
                header: {
                    alg: "RS256",
                    typ: "JWT",
                    kid: private_key_id
                }
            })
            const query = new URLSearchParams({
                grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
                assertion: token
            }).toString();
            const res = await fetch(`https://oauth2.googleapis.com/token?${query}`, {
                method: 'POST',
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded"
                }
            })
            const data = await res.json();
            if (!res.ok) {
                throw new Error(JSON.stringify(data));
            } else {
                const path = coraline.use('token');
                const filename = `${path}/${type}_token.json`;
                await coraline.saveJSON(filename, data);
                const credentials = await coraline.readJSON(filename)
                return credentials as Credentials;
            }
        } catch (err) {
            throw catchError(err);
        }
    }
}

export default serviceAccounts;