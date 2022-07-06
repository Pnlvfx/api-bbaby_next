import { Types } from "mongoose"

interface CommentProps {
    author: string
    authorAvatar: string
    body: string
    parentId: Types.ObjectId
    rootId: Types.ObjectId
}