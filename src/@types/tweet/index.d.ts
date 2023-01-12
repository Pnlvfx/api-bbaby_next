interface TweetProps {
  created_at: string;
  id: number;
  id_str: string;
  full_text: string;
  truncated: boolean;
  display_text_range: [number, number];
  entities: {
    hashtags: [];
    symbols: [];
    user_mentios: [];
    urls: [];
    media: [];
  };
  extended_entities: ExtendedEntitiesProps
  source: string
  user: TweetUserProps
  retweet_count: number
  favorite_count: number
  favorited: boolean
  retweeted: boolean
  possibly_sensitive: boolean
  possibly_sensitive_appealable: boolean
  lang: string
}

type TweetUserProps = {
        id: number
        id_str: string
        location: string
        description: string
        url: string
        protected: boolean
        followers_count: number
        friends_count: number
        listed_count: number
        created_at: string;
        /**
         * The name
         */
        name: string;
        /**
         * The image of the creator of this post
         */
        profile_image_url_https: string;
        /**
         * The username
         */
        screen_name: string;
        verified: boolean;
}

type ExtendedEntitiesProps = {
  media: [
    {
      id: number;
      id_str: string;
      /**
       * The image/video of the current post
       */
      media_url_https: string;
      sizes: {
        large: {
          h: number;
          resize: "fit" | "crop";
          w: number;
        };
        medium: {
          h: number;
          resize: "fit" | "crop";
          w: number;
        };
        small: {
          h: number;
          resize: "fit" | "crop";
          w: number;
        };
        thumb: {
          h: number;
          resize: "fit" | "crop";
          w: number;
        };
      };
      type: "video" | "image";
      video_info: {
        aspect_ratio: [16, 9];
        duration_millis: number;
        variants: [
          {
            contet_type: string;
            url: string;
            bitrate?: number;
          }
        ];
      };
    }
  ];
};
