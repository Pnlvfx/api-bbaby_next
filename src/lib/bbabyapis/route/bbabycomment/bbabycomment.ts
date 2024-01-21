import Comment from '../../../../models/comment';
import Post from '../../../../models/post';
import { IUser } from '../../../../models/types/user';

const bbabycomment = {
  createComment: async (user: IUser, body: string, rootId: string, parentId: string) => {
    const comment = new Comment({
      author: user.username,
      authorAvatar: user.avatar,
      body,
      parentId,
      rootId,
    });
    await comment.save();
    await Post.findByIdAndUpdate(rootId, { $inc: { numComments: +1 } });
    // await coraline.sendLog(`New comment added from ${user.username}: ${comment.body}`);
    return comment;
  },
};

export default bbabycomment;
