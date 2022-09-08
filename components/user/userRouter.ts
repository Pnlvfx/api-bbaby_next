import {Router} from 'express';
import auth from '../../middleware/auth';
import userCtrl from './userCtrl';

const userRouter = Router()

userRouter.get('/', userCtrl.user);

userRouter.get('/analytics', userCtrl.analytics);

userRouter.use('/', auth);

userRouter.get('/about', userCtrl.userInfo);

userRouter.post('/change_avatar', userCtrl.changeAvatar);

userRouter.post('/forgot', userCtrl.forgotPassword);

export default userRouter;