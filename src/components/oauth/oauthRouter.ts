import {Router} from 'express';
import oauthCtrl from './oauthCtrl';

const oauthRouter = Router();

oauthRouter.post('/register', oauthCtrl.register);

oauthRouter.post('/check_email', oauthCtrl.checkEmail);

oauthRouter.post('/activation', oauthCtrl.activateEmail);

oauthRouter.post('/login', oauthCtrl.login);

oauthRouter.post('/logout', oauthCtrl.logout);

oauthRouter.post('/google_login', oauthCtrl.googleLogin);

oauthRouter.get('/eu_cookie', oauthCtrl.getEUCookie);

oauthRouter.post('/eu_cookie', oauthCtrl.saveEUCookie);

export default oauthRouter;