import { Schema, model } from 'mongoose';
import { CommentProps } from '../@types/comment';

const CommentSchema = new Schema<CommentProps>(
  {
    author: { type: String, required: true },
    authorAvatar: { type: String, required: true },
    body: {
      type: String,
      required: true,
    },
    parentId: {
      type: Schema.Types.ObjectId,
    },
    rootId: {
      type: Schema.Types.ObjectId,
    },
    ups: {
      type: Number,
      default: 0,
    },
    liked: {
      type: Boolean || null,
    },
  },
  {
    timestamps: true,
  },
);
const Comment = model('Comment', CommentSchema);

export default Comment;
