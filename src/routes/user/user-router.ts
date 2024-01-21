import { Router } from 'express';
import auth from '../../middleware/auth';
import userCtrl from './user-ctrl';

const userRouter = Router();

userRouter.get('/', userCtrl.user);

//userRouter.get('/analytics', userCtrl.analytics);

userRouter.get('/about', auth, userCtrl.userInfo);

userRouter.post('/change_avatar', auth, userCtrl.changeAvatar);

userRouter.post('/forgot', auth, userCtrl.forgotPassword);

userRouter.get('/:username', userCtrl.userFromUsername);

export default userRouter;
