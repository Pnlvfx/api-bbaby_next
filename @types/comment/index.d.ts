import { Document, Types } from "mongoose"

interface CommentProps extends Document {
    author: string
    authorAvatar: string
    body: string
    parentId?: Types.ObjectId
    rootId: Types.ObjectId
    ups: number,
    liked: boolean | null
}