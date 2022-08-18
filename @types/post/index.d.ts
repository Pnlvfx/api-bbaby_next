import { Types, Document } from "mongoose";

interface PostProps extends Document {
    author: string
    authorAvatar: string
    title: string
    body: string
    community: string
    communityIcon: string
    mediaInfo: MediaInfoProps
    ups: number
    liked: string
    numComments: number
    _id: string
}

interface MediaInfoProps {
    dimension?: Types.Array
    isImage?: boolean
    isVideo?: boolean
    image?:string
    video?: {
        url?: string
    }
}