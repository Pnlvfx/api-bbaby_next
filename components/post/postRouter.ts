import express from 'express'
import PostCtrl from './postCtrl'

const postRouter = express.Router()

postRouter.get('/posts', PostCtrl.getPosts)

postRouter.get('/posts/:id', PostCtrl.getPost)

postRouter.post('/posts', PostCtrl.createPost)

postRouter.post('/posts/:id/vote', PostCtrl.voting)

postRouter.delete('/posts/:id', PostCtrl.deletePost)

export default postRouter