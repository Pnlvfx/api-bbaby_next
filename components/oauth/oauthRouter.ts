import {Router} from 'express';
import oauthCtrl from './oauthCtrl';

const oauthRouter = Router();

oauthRouter.post('/register', oauthCtrl.register);

oauthRouter.post('/activation', oauthCtrl.activateEmail);

oauthRouter.post('/login', oauthCtrl.login);

oauthRouter.post('/logout', oauthCtrl.logout);

oauthRouter.post('/google_login', oauthCtrl.googleLogin);

export default oauthRouter;