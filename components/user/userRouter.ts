import {Router} from 'express'
import auth from '../../middleware/auth'
import userCtrl from './userCtrl'

const userRouter = Router()

userRouter.post('/register', userCtrl.register)

userRouter.post('/activation', userCtrl.activateEmail)

userRouter.post('/login', userCtrl.login)

userRouter.get('/user', userCtrl.user)

userRouter.get('/user/about', auth, userCtrl.userInfo)

userRouter.post('/user/change_avatar', userCtrl.changeAvatar)

userRouter.post('/forgot', userCtrl.forgotPassword)

userRouter.post('/logout', userCtrl.logout)

userRouter.post('/google_login',userCtrl.googleLogin)

userRouter.get('/reddit_login', auth,  userCtrl.redditLogin)

userRouter.get('/reddit_logout', auth, userCtrl.redditLogout)

userRouter.get('/reddit_posts', auth, userCtrl.redditPosts)

export default userRouter;