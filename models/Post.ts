import {Schema,model} from "mongoose";

const PostSchema = new Schema<PostProps>({
    author: 
        {type:String,
        required:true
    },
    authorAvatar: 
        {type:String,
        required:true
    },
    title: 
        {type:String,
        required:true
    },
    body: {
        type:String
    },
    image: {
        type:String
    },
    community: {
        type:String,
        required:true
    },
    communityIcon: {
        type:String,
        required:true
    },
    mediaInfo: {
            dimension: { 
            type: [],
            default: undefined,
            },
            isImage: {
                type: Boolean,
                default: false
            },
            // imageInfo: {
            //     type: [],
            // },
    },
    imageId: {
        type: String,
    },
    ups: {
        type:Number,
        default: 0
    },
    liked: {
        type: String,
        default: null
    },
    numComments: {
        type: Number,
        default: 0
    },
},
{
    timestamps:true
}
);
const Post = model('Post', PostSchema);

export default Post;