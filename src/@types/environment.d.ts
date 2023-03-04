/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
namespace NodeJS {
  interface ProcessEnv {
    MONGO_URI: string;
    CLIENT_URL: string;
    SERVER_URL: string;
    TELEGRAM_TOKEN: string;
    SECRET: string;
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
    NODE_ENV: 'development' | 'production';
    PEXELS_API_KEY: string;
    OPENAI_API_KEY: string;
    IP_LOOKUP_API_KEY: string;
  }
}
