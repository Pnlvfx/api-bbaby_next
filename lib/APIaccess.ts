import config from "../config/config";

const {NODE_ENV} = config;

export const corsOrigin = NODE_ENV === 'production' ? [
    'https://www.bbabystyle.com',
    'https://new.bbabystyle.com'
] : [
    'http://localhost:3000',
    'http://192.168.1.22:3000',
    'http://127.0.0.1:3000'
]

const validGoogleOrigin = [
    'https://www.bbabystyle.com',
    'https://new.bbabystyle.com',
    'http://localhost:3000',
    'http://127.0.0.1:3000',
]
export const isGoogleAPI = (req_origin: string) => {
    const origins = validGoogleOrigin;
    const check = origins.find((origin) => origin === req_origin) ? true : false;
    return check;
}
