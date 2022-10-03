import {Schema, model} from "mongoose";
import { CommunityProps } from "../@types/community";

const schema = new Schema<CommunityProps>({
    name: {
        type: String,
        required:true,
    },
    communityAvatar: {
        type: String,
        default: 'https://res.cloudinary.com/bbabystyle/image/upload/v1652738651/default/defaultCommunityAvatar_zdywvw.jpg'
    },
    cover: {
        type: String,
        default:'https://res.cloudinary.com/bbabystyle/image/upload/v1652738627/default/defaultCommunityCover_h9scxu.jpg'
    },
    communityAuthor: {
        type: String,
        required: true
    },
    description: {
        type: String,
        default: 'Add your description'
    },
    acceptFollowers: {
        type: Boolean,
        default: true
    },
    subscribers: {
        type: Number,
        default: 1,
    },
    user_is_moderator: {
        type: Boolean,
    },
    user_is_banned: {
        type: Boolean,
    },
    user_is_contributor: {
        type: Boolean,
    },
    user_is_subscriber: {
        type: Boolean,
    },
    number_of_posts: {
        type: Number,
        default: 0
    },
    language: {
        type: String,
        default: 'en'
    },
    region: {
        type: String,
    },
    category: {
        type: String,
    },
    sub_categories: {
        type: [String]
    }
},
{
    timestamps:true
}
);

const Community = model('Community', schema);

export default Community;