import type {Request, Response} from 'express';
import { catchErrorCtrl } from '../../lib/common';
import Comment from '../../models/Comment';
import Post from '../../models/Post';
import { getUserFromToken } from '../user/user-functions/userFunctions';

const commentCtrl = {
    createComment: async (req: Request,res: Response) => {
        try {
            const {token} = req.cookies;
            if(!token) {
                return res.status(401).json({msg: "You need to login first"})
            }
            const user = await getUserFromToken(token)
            if (!user) return res.status(401).json({msg: "You need to login first"})
            const {body, parentId, rootId} = req.body;
            const comment = new Comment({
                author:user.username,
                authorAvatar:user.avatar,
                body,
                parentId,
                rootId,
            })
            const savedComment = await comment.save()
                if (!savedComment) return res.status(500).json({msg: "Something went wrong in our database, sorry for the inconvenience."})
                const postNumComments = await Post.findByIdAndUpdate(rootId, {$inc : {'numComments' : +1}})
                    if (!postNumComments) return res.status(500).json({msg: "Something went wrong in our database, sorry for the inconvenience."})
                    res.json(savedComment)
        } catch (err) {
            catchErrorCtrl(err, res, 'commentCtrl.createComment');
        }
    },
    childComments: async (req: Request,res :Response) => {
        try {
            const {rootId} = req.params
            const comments = await Comment.find({rootId:rootId}).sort({createdAt: -1})
            if (!comments) return res.status(500).json({msg: "Failed to load comments for this posts, it could be for some reason. Try to refresh the page otherwise this posts could be banned"})
            res.status(200).json(comments)       
        } catch (err) {
            catchErrorCtrl(err, res, 'commentCtrl.childComments');
        }
    },
}

export default commentCtrl