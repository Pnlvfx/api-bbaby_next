interface TweetProps {
    created_at: string,
    extended_entities: {
        media: [{
            id: number
            id_str: string
            /**
            * The image/video of the current post
            */
            media_url_https: string
            sizes: {
                large: {
                    h: number
                    resize: 'fit' | 'crop'
                    w: number
                }
                medium: {
                    h: number
                    resize: 'fit' | 'crop'
                    w: number
                }
                small: {
                    h: number
                    resize: 'fit' | 'crop'
                    w: number
                }
                thumb: {
                    h: number
                    resize: 'fit' | 'crop'
                    w: number
                }
            }
            type: 'video' | 'image'
            video_info: {
                aspect_ratio: [16, 9]
                duration_millis: number
                variants: [{
                    contet_type: string
                    url: string
                    bitrate?: number
                }]
            }
        }]
    }
    full_text: string
    lang: string
    id: number
    id_str: string
    user: {
        created_at: string
        /**
        * The name
        */
        name: string
        /**
        * The image of the creator of this post
        */
        profile_image_url_https: string
        /**
        * The username
        */
        screen_name: string
        verified: boolean
    }
}