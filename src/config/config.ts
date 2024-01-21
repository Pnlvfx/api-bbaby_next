import dotenv from 'dotenv';
dotenv.config();

interface ENV {
  SERVER_URL: string | undefined;
  NODE_ENV: string | undefined;
  MONGO_URI: string | undefined;
  SECRET: string | undefined;
  TELEGRAM_TOKEN: string | undefined;
  CLOUD_NAME: string | undefined;
  CLOUD_API_KEY: string | undefined;
  CLOUD_API_SECRET: string | undefined;
  TWITTER_CLIENT_ID: string | undefined;
  TWITTER_CLIENT_SECRET: string | undefined;
  TWITTER_BEARER_TOKEN: string | undefined;
  ACTIVATION_TOKEN_SECRET: string | undefined;
  SENDER_EMAIL_ADDRESS: string | undefined;
  SENDER_EMAIL_PASSWORD: string | undefined;
  GOOGLE_SECRET: string | undefined;
  REDDIT_CLIENT_ID: string | undefined;
  REDDIT_CLIENT_SECRET: string | undefined;
  YOUTUBE_CLIENT_ID: string | undefined;
  YOUTUBE_CLIENT_SECRET: string | undefined;
  PEXELS_API_KEY: string | undefined;
  OPENAI_API_KEY: string | undefined;
  OPENAI_API_KEY_2: string | undefined;
  IP_LOOKUP_API_KEY: string | undefined;
}
export interface Config {
  SERVER_URL: string;
  NODE_ENV: 'development' | 'production';
  MONGO_URI: string;
  SECRET: string;
  TELEGRAM_TOKEN: string;
  CLOUD_NAME: string;
  CLOUD_API_KEY: string;
  CLOUD_API_SECRET: string;
  TWITTER_CLIENT_ID: string;
  TWITTER_CLIENT_SECRET: string;
  TWITTER_BEARER_TOKEN: string;
  ACTIVATION_TOKEN_SECRET: string;
  SENDER_EMAIL_ADDRESS: string;
  SENDER_EMAIL_PASSWORD: string;
  GOOGLE_SECRET: string;
  REDDIT_CLIENT_ID: string;
  REDDIT_CLIENT_SECRET: string;
  YOUTUBE_CLIENT_ID: string;
  YOUTUBE_CLIENT_SECRET: string;
  PEXELS_API_KEY: string;
  OPENAI_API_KEY: string;
  OPENAI_API_KEY_2: string;
  IP_LOOKUP_API_KEY: string;
}

const getConfig = (): ENV => {
  return {
    SERVER_URL: process.env.SERVER_URL,
    NODE_ENV: process.env.NODE_ENV,
    MONGO_URI: process.env.MONGO_URI,
    SECRET: process.env.SECRET,
    TELEGRAM_TOKEN: process.env.TELEGRAM_TOKEN,
    CLOUD_NAME: process.env.CLOUD_NAME,
    CLOUD_API_KEY: process.env.CLOUD_API_KEY,
    CLOUD_API_SECRET: process.env.CLOUD_API_SECRET,
    TWITTER_CLIENT_ID: process.env.TWITTER_CLIENT_ID,
    TWITTER_CLIENT_SECRET: process.env.TWITTER_CLIENT_SECRET,
    TWITTER_BEARER_TOKEN: process.env.TWITTER_BEARER_TOKEN,
    ACTIVATION_TOKEN_SECRET: process.env.ACTIVATION_TOKEN_SECRET,
    SENDER_EMAIL_ADDRESS: process.env.SENDER_EMAIL_ADDRESS,
    SENDER_EMAIL_PASSWORD: process.env.SENDER_EMAIL_PASSWORD,
    GOOGLE_SECRET: process.env.GOOGLE_SECRET,
    REDDIT_CLIENT_ID: process.env.REDDIT_CLIENT_ID,
    REDDIT_CLIENT_SECRET: process.env.REDDIT_CLIENT_SECRET,
    YOUTUBE_CLIENT_ID: process.env.YOUTUBE_CLIENT_ID,
    YOUTUBE_CLIENT_SECRET: process.env.YOUTUBE_CLIENT_SECRET,
    PEXELS_API_KEY: process.env.PEXELS_API_KEY,
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    OPENAI_API_KEY_2: process.env.OPENAI_API_KEY_2,
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
const _config = getConfig();

const config = getSanitzedConfig(_config);

export default config;
