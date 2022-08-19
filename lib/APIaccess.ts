import config from "../config/config"

const {NODE_ENV} = config;

export const corsOrigin = () => {
    const origin = NODE_ENV === 'production' ? [
        'https://www.bbabystyle.com'
    ] : [
        'http://localhost:3000',
        'http://192.168.1.22:3000',
        'http://127.0.0.1:3000'
    ]
    return origin;
}

export const isGoogleAPI = (req_origin:string) => {
    const origins = corsOrigin();
    const check = origins.find((origin) => origin === req_origin);
    console.log(check)
}