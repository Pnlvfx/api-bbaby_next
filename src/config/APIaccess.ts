import config from "./config";

const {NODE_ENV} = config;

export const corsOrigin = NODE_ENV === 'production' ? [
    'https://www.bbabystyle.com',
    'https://bbabystyle.com'
] : [
    'http://localhost:3000',
    'http://192.168.1.27:3000',
    'http://192.168.1.7:3000',
    'http://192.168.1.21:3000',
    'http://127.0.0.1:3000'
]

