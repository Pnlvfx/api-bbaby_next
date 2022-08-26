interface RedditPosts {
    data: {
        subreddit: string
        saved: boolean
        title: string
        hidden: boolean
        thumbnail_height: number
        thumbnail?: string
        media_only: boolean
        num_comments: number
        subreddit_subscribers: number
        upvote_ratio: number
        subreddit_type: 'private' | 'public'
        ups: number 
        category: string | null
        is_robot_indexable: boolean
        url: string
        media: null | RedditMediaProps
        is_video: boolean
    }
}

type RedditMediaProps = {
    reddit_video: {
        height: number
        width: number
        fallback_url: string
        dash_url: string
        hls_url: string
        is_gif: boolean
        transcoding_status: string
    }
}