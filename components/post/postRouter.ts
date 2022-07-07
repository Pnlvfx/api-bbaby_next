import express from 'express'
import PostCtrl from './postCtrl'

const postRouter = express.Router()

postRouter.get('/posts', PostCtrl.getPosts)

postRouter.post('/posts', PostCtrl.createPost)

export default postRouter