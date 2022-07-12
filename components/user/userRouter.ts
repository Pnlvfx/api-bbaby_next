import express from 'express'
import userCtrl from './userCtrl'

const userRouter = express.Router()

userRouter.post('/register', userCtrl.register)

userRouter.post('/activation', userCtrl.activateEmail)

userRouter.post('/login', userCtrl.login)

userRouter.get('/user', userCtrl.user)

userRouter.get('/user/about', userCtrl.userInfo)

userRouter.post('/user/change_avatar', userCtrl.changeAvatar)

userRouter.post('/forgot', userCtrl.forgotPassword)

userRouter.post('/logout', userCtrl.logout)

userRouter.post('/google_login',userCtrl.googleLogin)

userRouter.get('/reddit_login', userCtrl.redditLogin)

export default userRouter