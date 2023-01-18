import { Document, Types } from "mongoose";

interface PostProps extends Document {
    author: string
    authorAvatar: string
    title: string
    body: string
    community: string
    communityIcon: string
    mediaInfo: MediaInfoProps
    ups: number
    liked: null | boolean
    numComments: number
    url: string
}

interface MediaInfoProps {
    dimension?: Types.Array<number>
    isImage?: boolean
    isVideo?: boolean
    image?:string
    video?: {
        url?: string
        thumbnail: string
    }
}