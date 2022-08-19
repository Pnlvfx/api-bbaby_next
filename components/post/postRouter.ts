import {Router} from 'express'
import auth from '../../middleware/auth'
import PostCtrl from './postCtrl'

const postRouter = Router()

postRouter.get('/posts', PostCtrl.getPosts)

postRouter.get('/posts/:id', PostCtrl.getPost)

postRouter.post('/posts', auth, PostCtrl.createPost)

postRouter.post('/posts/:id/vote', auth, PostCtrl.voting)

postRouter.delete('/posts/:id', PostCtrl.deletePost)

export default postRouter