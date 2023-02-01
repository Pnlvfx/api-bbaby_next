/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
interface RedditResponse {
  kind: string;
  data: {
    after: string;
    dist: number;
    modhash: string;
    geo_filter: null;
    children: RedditPostsProps[];
    before: null;
  };
}

interface RedditPostsProps {
  king: string;
  data: {
    approved_at_utc: null;
    subreddit: string;
    selftext: string;
    author_fullname: string;
    saved: boolean;
    mod_reason_title: null;
    gilded: number;
    clicked: boolean;
    ups: number;
    title: string;
    hidden: boolean;
    thumbnail_height: number;
    thumbnail?: string;
    media_only: boolean;
    num_comments: number;
    subreddit_subscribers: number;
    upvote_ratio: number;
    subreddit_type: 'private' | 'public';
    category: string | null;
    is_robot_indexable: boolean;
    media: null | RedditMediaProps;
    is_video: boolean;
    created: string;
    created_utc: string;
    sr_detail?: {
      community_icon: string;
    };
    preview: {
      enabled: boolean;
      images: PreviewImagesProps[];
    };
    url: string;
    id: string;
  };
}

type PreviewImagesProps = {
  id?: string;
  source: {
    height: number;
    url: string;
    width: number;
  };
};

type RedditMediaProps = {
  reddit_video: {
    height: number;
    width: number;
    fallback_url: string;
    dash_url: string;
    hls_url: string;
    is_gif: boolean;
    transcoding_status: string;
  };
};
