import express from 'express'
import commentCtrl from './commentCtrl'

const commentRouter = express.Router()

commentRouter.post('/', commentCtrl.createComment)

commentRouter.get('/root/:rootId', commentCtrl.childComments)

export default commentRouter;