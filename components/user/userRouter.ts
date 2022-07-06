import express from 'express'
import userCtrl from './userCtrl'

const userRouter = express.Router()

userRouter.get('/user', userCtrl.user)

export default userRouter