import dotenv from 'dotenv'
import path from 'path'

dotenv.config({path: path.resolve(__dirname, "../config/config.env")})

interface ENV {
    MONGO_URI: string | undefined
    CLIENT_URL: string | undefined
    CORS_ORIGIN1: string | undefined
    CORS_ORIGIN2: string | undefined
    TELEGRAM_TOKEN: string | undefined
    SECRET: string | undefined
    PUBLIC_PATH: string | undefined
    CLOUD_NAME: string | undefined
    CLOUD_API_KEY: string | undefined
    CLOUD_API_SECRET: string | undefined
    GOOGLE_APPLICATION_CREDENTIALS: string | undefined
    YOUTUBE_CREDENTIALS: string | undefined
    TWITTER_CONSUMER_KEY: string | undefined
    TWITTER_CONSUMER_SECRET: string | undefined
    ACTIVATION_TOKEN_SECRET: string | undefined
    MAILING_SERVICE_CLIENT_ID: string | undefined
    MAILING_SERVICE_CLIENT_SECRET: string | undefined
    MAILING_SERVICE_REFRESH_TOKEN: string | undefined
    SENDER_EMAIL_ADDRESS: string | undefined
    COOKIE_DOMAIN: string | undefined
}

interface Config {
    MONGO_URI: string
    CLIENT_URL: string
    CORS_ORIGIN1: string
    CORS_ORIGIN2: string
    TELEGRAM_TOKEN: string
    SECRET: string
    PUBLIC_PATH: string
    CLOUD_NAME: string
    CLOUD_API_KEY: string
    CLOUD_API_SECRET: string
    GOOGLE_APPLICATION_CREDENTIALS: string
    YOUTUBE_CREDENTIALS: string
    TWITTER_CONSUMER_KEY: string
    TWITTER_CONSUMER_SECRET: string
    ACTIVATION_TOKEN_SECRET: string
    MAILING_SERVICE_CLIENT_ID: string
    MAILING_SERVICE_CLIENT_SECRET: string
    MAILING_SERVICE_REFRESH_TOKEN: string
    SENDER_EMAIL_ADDRESS: string
    COOKIE_DOMAIN: string
}

const getConfig = ():ENV => {
    return {
        MONGO_URI: process.env.MONGO_URI,
        CLIENT_URL: process.env.CLIENT_URL,
        CORS_ORIGIN1: process.env.CORS_ORIGIN1,
        CORS_ORIGIN2: process.env.CORS_ORIGIN2,
        TELEGRAM_TOKEN: process.env.TELEGRAM_TOKEN,
        SECRET: process.env.SECRET,
        PUBLIC_PATH: process.env.PUBLIC_PATH,
        CLOUD_NAME: process.env.CLOUD_NAME,
        CLOUD_API_KEY: process.env.CLOUD_API_KEY,
        CLOUD_API_SECRET: process.env.CLOUD_API_SECRET,
        GOOGLE_APPLICATION_CREDENTIALS: process.env.GOOGLE_APPLICATION_CREDENTIALS,
        YOUTUBE_CREDENTIALS: process.env.YOUTUBE_CREDENTIALS,
        TWITTER_CONSUMER_KEY: process.env.TWITTER_CONSUMER_KEY,
        TWITTER_CONSUMER_SECRET: process.env.TWITTER_CONSUMER_SECRET,
        ACTIVATION_TOKEN_SECRET: process.env.ACTIVATION_TOKEN_SECRET,
        MAILING_SERVICE_CLIENT_ID: process.env.MAILING_SERVICE_CLIENT_ID,
        MAILING_SERVICE_CLIENT_SECRET: process.env.MAILING_SERVICE_CLIENT_SECRET,
        MAILING_SERVICE_REFRESH_TOKEN: process.env.MAILING_SERVICE_REFRESH_TOKEN,
        SENDER_EMAIL_ADDRESS: process.env.SENDER_EMAIL_ADDRESS,
        COOKIE_DOMAIN: process.env.COOKIE_DOMAIN
    }
}

const getSanitzedConfig = (config:ENV): Config => {
    for (const [key,value] of Object.entries(config)) {
        if (value === undefined) {
            console.log(`Missing key ${key}`)
        }
    }
    return config as Config;
}
const config = getConfig()

const sanitizedConfig = getSanitzedConfig(config);

export default sanitizedConfig