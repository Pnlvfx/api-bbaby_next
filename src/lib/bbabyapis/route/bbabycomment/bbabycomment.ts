import { catchError } from '../../../../coraline/cor-route/crlerror';
import coraline from '../../../../coraline/coraline';
import Comment from '../../../../models/Comment';
import Post from '../../../../models/Post';
import { IUser } from '../../../../models/types/user';

const bbabycomment = {
  createComment: async (user: IUser, body: string, rootId: string, parentId: string) => {
    try {
      const comment = new Comment({
        author: user.username,
        authorAvatar: user.avatar,
        body,
        parentId,
        rootId,
      });
      await comment.save();
      await Post.findByIdAndUpdate(rootId, { $inc: { numComments: +1 } });
      coraline.sendLog(`New comment added from ${user.username}`);
      return comment;
    } catch (err) {
      throw catchError(err);
    }
  },
};

export default bbabycomment;
