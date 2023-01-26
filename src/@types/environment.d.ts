namespace NodeJS {
    interface ProcessEnv {
        MONGO_URI: string
        CLIENT_URL: string
        SERVER_URL: string
        TELEGRAM_TOKEN: string
        SECRET: string
        SESSION_TRACKER: string
        CLOUD_NAME: string
        CLOUD_API_KEY: string
        CLOUD_API_SECRET: string
        TWITTER_CONSUMER_KEY: string
        TWITTER_CONSUMER_SECRET: string
        ACTIVATION_TOKEN_SECRET: string
        MAILING_SERVICE_CLIENT_ID: string
        MAILING_SERVICE_CLIENT_SECRET: string
        MAILING_SERVICE_REFRESH_TOKEN: string
        SENDER_EMAIL_ADDRESS: string
        GOOGLE_SECRET: string
        ANON_ACCESS_TOKEN: string
        ANON_ACCESS_TOKEN_SECRET: string
        BBABYITALIA_ACCESS_TOKEN: string
        BBABYITALIA_ACCESS_TOKEN_SECRET: string
        BBABY_ACCESS_TOKEN: string
        BBABY_ACCESS_TOKEN_SECRET: string
        REDDIT_CLIENT_ID: string
        REDDIT_CLIENT_SECRET: string
        YOUTUBE_CLIENT_ID: string
        YOUTUBE_CLIENT_SECRET: string
        NODE_ENV: 'development' | 'production';
        PEXELS_API_KEY: string
        OPENAI_API_KEY: string
        IP_LOOKUP_API_KEY: string
    }
  }