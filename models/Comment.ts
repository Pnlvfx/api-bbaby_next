import {Schema,model} from "mongoose";
import { CommentProps } from "../@types/comment";

const CommentSchema = new Schema<CommentProps>({
    author: 
        {type:String,
        required:true
    },
    authorAvatar: 
        {type:String,
        required:true
    },
    body: {
        type:String,
        required:true
    },
    parentId: {
        type:Schema.Types.ObjectId,
        required:false
    },
    rootId: {
        type:Schema.Types.ObjectId,
        required:false
    },
},
{
    timestamps:true
}
);
const Comment = model('Comment', CommentSchema);

export default Comment;