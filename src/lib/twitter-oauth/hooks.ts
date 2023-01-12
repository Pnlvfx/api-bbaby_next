import config from '../../config/config';
import https from 'https';

export const TwitterHeader = () => {
    const request_url = "https://api.twitter.com/oauth/request_token";
    const oauth_version = "1.0"
    const nonceSize = 32;
    const headers = {
        "Accept": "*/*",
        "Connection": "close",
        "User-Agent": "Node authentication"
    }
    const separator = ",";
    const encodeData = (toEncode: any) => {
        if (toEncode == null || toEncode == "") return "";
        else {
            const result = encodeURIComponent(toEncode);
            return result.replace(/\!/g, '%21')
            .replace(/\'/g, '%27')
            .replace(/\(/g, '%28')
            .replace(/\)/g, '%29')
            .replace(/\*/g, '%2A')
        }
    }

    const decodeData = (toDecode: any) => {
        if (toDecode != null) {
            toDecode = toDecode.replace(/\+/g, " ");
        }
        return decodeURIComponent(toDecode);
    }

    const buildAuthorizationHeaders = (orderedParameters: any) => {
        let authHeader = "OAuth ";
        for (var i = 0; i < orderedParameters.length; i++) {
            authHeader+= "" + encodeData(orderedParameters[i][0])+"=\""+encodeData(orderedParameters[i][1])+"\""+separator;
        }
        authHeader= authHeader.substring(0, authHeader.length-separator.length);
        return authHeader;
    }

    const nonce_chars = ['a','b','c','d','e','f','g','h','i','j','k','l','m','n',
    'o','p','q','r','s','t','u','v','w','x','y','z','A','B',
    'C','D','E','F','G','H','I','J','K','L','M','N','O','P',
    'Q','R','S','T','U','V','W','X','Y','Z','0','1','2','3',
    '4','5','6','7','8','9'];

    const getNonce = (nonceSize: number) => {
        let result = [];
        const chars = nonce_chars;
        let chars_pos;
        const nonce_chars_length = chars.length;
        for (var i = 0; i < nonceSize; i++) {
            chars_pos = Math.floor(Math.random() * nonce_chars_length);
            result[i]= chars[chars_pos];
        }
        return result.join('');
    }

    const oauth_timestamp = Math.floor((new Date().getTime() / 1000));
    const oauth_nonce = getNonce(nonceSize);
    const parameters = {
        oauth_consumer_key: config.TWITTER_CONSUMER_KEY,
        oauth_signature_method: "HMAC-SHA1",
        oauth_timestamp,
        oauth_nonce,
        oauth_version
    }

    // const createClient = () => {
    //     const options = {
    //         host: '',
    //         port: '',
    //         path: '',
    //         method: '',
    //         headers: ''
    //     }
    //     const httpModel = https;
    //     return https.request(options);
    // }
}