import type { Request, Response } from 'express';
import Comment from '../../models/Comment';
import { catchErrorCtrl } from '../../coraline/cor-route/crlerror';
import { UserRequest } from '../../@types/express';
import bbabycomment from '../../lib/bbabyapis/route/bbabycomment/bbabycomment';

const commentCtrl = {
  createComment: async (userRequest: Request, res: Response) => {
    try {
      const req = userRequest as UserRequest;
      const { user } = req;
      const { body, parentId, rootId } = req.body;
      const comment = await bbabycomment.createComment(user, body, rootId, parentId);
      res.json(comment);
    } catch (err) {
      catchErrorCtrl(err, res);
    }
  },
  childComments: async (req: Request, res: Response) => {
    try {
      const { rootId } = req.params;
      const comments = await Comment.find({ rootId: rootId }).sort({ createdAt: -1 });
      if (!comments)
        return res.status(500).json({
          msg: 'Failed to load comments for this posts, it could be for some reason. Try to refresh the page otherwise this posts could be banned',
        });
      res.status(200).json(comments);
    } catch (err) {
      catchErrorCtrl(err, res);
    }
  },
};

export default commentCtrl;
