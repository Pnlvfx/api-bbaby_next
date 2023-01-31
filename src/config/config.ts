import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

interface ENV {
  MONGO_URI: string | undefined;
  CLIENT_URL: string | undefined;
  SERVER_URL: string | undefined;
  TELEGRAM_TOKEN: string | undefined;
  SECRET: string | undefined;
  CLOUD_NAME: string | undefined;
  CLOUD_API_KEY: string | undefined;
  CLOUD_API_SECRET: string | undefined;
  TWITTER_CONSUMER_KEY: string | undefined;
  TWITTER_CONSUMER_SECRET: string | undefined;
  ACTIVATION_TOKEN_SECRET: string | undefined;
  SENDER_EMAIL_ADDRESS: string | undefined;
  SENDER_EMAIL_PASSWORD: string | undefined;
  GOOGLE_SECRET: string | undefined;
  ANON_ACCESS_TOKEN: string | undefined;
  ANON_ACCESS_TOKEN_SECRET: string | undefined;
  BBABYITALIA_ACCESS_TOKEN: string | undefined;
  BBABYITALIA_ACCESS_TOKEN_SECRET: string | undefined;
  BBABY_ACCESS_TOKEN: string | undefined;
  BBABY_ACCESS_TOKEN_SECRET: string | undefined;
  REDDIT_CLIENT_ID: string | undefined;
  REDDIT_CLIENT_SECRET: string | undefined;
  YOUTUBE_CLIENT_ID: string | undefined;
  YOUTUBE_CLIENT_SECRET: string | undefined;
  NODE_ENV: string | undefined;
  PEXELS_API_KEY: string | undefined;
  OPENAI_API_KEY: string | undefined;
  IP_LOOKUP_API_KEY: string | undefined;
}

interface Config {
  MONGO_URI: string;
  CLIENT_URL: string;
  SERVER_URL: string;
  TELEGRAM_TOKEN: string;
  SECRET: string;
  CLOUD_NAME: string;
  CLOUD_API_KEY: string;
  CLOUD_API_SECRET: string;
  TWITTER_CONSUMER_KEY: string;
  TWITTER_CONSUMER_SECRET: string;
  ACTIVATION_TOKEN_SECRET: string;
  SENDER_EMAIL_ADDRESS: string;
  SENDER_EMAIL_PASSWORD: string;
  GOOGLE_SECRET: string;
  ANON_ACCESS_TOKEN: string;
  ANON_ACCESS_TOKEN_SECRET: string;
  BBABYITALIA_ACCESS_TOKEN: string;
  BBABYITALIA_ACCESS_TOKEN_SECRET: string;
  BBABY_ACCESS_TOKEN: string;
  BBABY_ACCESS_TOKEN_SECRET: string;
  REDDIT_CLIENT_ID: string;
  REDDIT_CLIENT_SECRET: string;
  YOUTUBE_CLIENT_ID: string;
  YOUTUBE_CLIENT_SECRET: string;
  NODE_ENV: 'development' | 'production';
  PEXELS_API_KEY: string;
  OPENAI_API_KEY: string;
  IP_LOOKUP_API_KEY: string;
}

const getConfig = (): ENV => {
  return {
    MONGO_URI: process.env.MONGO_URI,
    CLIENT_URL: process.env.CLIENT_URL,
    SERVER_URL: process.env.SERVER_URL,
    TELEGRAM_TOKEN: process.env.TELEGRAM_TOKEN,
    SECRET: process.env.SECRET,
    CLOUD_NAME: process.env.CLOUD_NAME,
    CLOUD_API_KEY: process.env.CLOUD_API_KEY,
    CLOUD_API_SECRET: process.env.CLOUD_API_SECRET,
    TWITTER_CONSUMER_KEY: process.env.TWITTER_CONSUMER_KEY,
    TWITTER_CONSUMER_SECRET: process.env.TWITTER_CONSUMER_SECRET,
    ACTIVATION_TOKEN_SECRET: process.env.ACTIVATION_TOKEN_SECRET,
    SENDER_EMAIL_ADDRESS: process.env.SENDER_EMAIL_ADDRESS,
    SENDER_EMAIL_PASSWORD: process.env.SENDER_EMAIL_PASSWORD,
    GOOGLE_SECRET: process.env.GOOGLE_SECRET,
    ANON_ACCESS_TOKEN: process.env.ANON_ACCESS_TOKEN,
    ANON_ACCESS_TOKEN_SECRET: process.env.ANON_ACCESS_TOKEN_SECRET,
    BBABYITALIA_ACCESS_TOKEN: process.env.BBABYITALIA_ACCESS_TOKEN,
    BBABYITALIA_ACCESS_TOKEN_SECRET: process.env.BBABYITALIA_ACCESS_TOKEN_SECRET,
    BBABY_ACCESS_TOKEN: process.env.BBABY_ACCESS_TOKEN,
    BBABY_ACCESS_TOKEN_SECRET: process.env.BBABY_ACCESS_TOKEN_SECRET,
    REDDIT_CLIENT_ID: process.env.REDDIT_CLIENT_ID,
    REDDIT_CLIENT_SECRET: process.env.REDDIT_CLIENT_SECRET,
    YOUTUBE_CLIENT_ID: process.env.YOUTUBE_CLIENT_ID,
    YOUTUBE_CLIENT_SECRET: process.env.YOUTUBE_CLIENT_SECRET,
    NODE_ENV: process.env.NODE_ENV,
    PEXELS_API_KEY: process.env.PEXELS_API_KEY,
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    IP_LOOKUP_API_KEY: process.env.IP_LOOKUP_API_KEY,
  };
};

const getSanitzedConfig = (config: ENV): Config => {
  for (const [key, value] of Object.entries(config)) {
    if (value === undefined) {
      throw new Error(`Missing key ${key}`);
    }
  }
  return config as Config;
};
const config = getConfig();

const sanitizedConfig = getSanitzedConfig(config);

export default sanitizedConfig;
