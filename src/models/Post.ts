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
    community: {
      type: String,
      required: true,
    },
    communityIcon: {
      type: String,
      required: true,
    },
    permalink: {
      type: String,
      required: true,
    },
    body: {
      type: String,
    },
    community_detail: {
      type: Schema.Types.ObjectId,
      ref: 'Community',
    },
    mediaInfo: {
      dimension: {
        type: Array<number>,
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
        type: {
          url: String,
        },
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
  },
  {
    timestamps: true,
  },
);
const Post = model('Post', PostSchema);

export default Post;
