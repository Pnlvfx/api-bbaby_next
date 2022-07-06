import express from 'express'
import PostCtrl from './postCtrl'

const postRouter = express.Router()

postRouter.post('/posts', PostCtrl.createPost)

export default postRouter