import { Schema, model } from 'mongoose';
import { PostProps } from './types/post';

const PostSchema = new Schema<PostProps>(
  {
    author: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    body: {
      type: String,
    },
    community: {
      type: String,
      required: true,
    },
    communityIcon: {
      type: String,
      required: true,
    },
    community_detail: {},
    mediaInfo: {
      dimension: {
        type: Array,
      },
      isImage: {
        type: Boolean,
      },
      isVideo: {
        type: Boolean,
      },
      image: {
        type: String,
      },
      video: {
        type: Object,
      },
    },
    ups: {
      type: Number,
      default: 0,
    },
    liked: {},
    numComments: {
      type: Number,
      default: 0,
    },
    permalink: {
      type: String,
    },
  },
  {
    timestamps: true,
  },
);
const Post = model('Post', PostSchema);

export default Post;
