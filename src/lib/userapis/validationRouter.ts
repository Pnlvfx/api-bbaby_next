import { Router } from 'express';
import validationCtrl from './validationCtrl';

const validationRouter = Router();

validationRouter.post('/check_email', validationCtrl.checkEmail);

validationRouter.post('/check_username', validationCtrl.checkUsername);

validationRouter.post('/check_password', validationCtrl.checkPass);

export default validationRouter;
