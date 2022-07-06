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