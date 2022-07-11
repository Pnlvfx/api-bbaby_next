import express from 'express'
import commentCtrl from './commentCtrl'

const commentRouter = express.Router()

commentRouter.post('/comments', commentCtrl.createComment)

commentRouter.get('/comments/root/:rootId', commentCtrl.childComments)

export default commentRouter
