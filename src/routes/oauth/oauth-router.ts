import { Router } from 'express';
import oauthCtrl from './oauth-ctrl';
import auth from '../../middleware/auth';

const oauthRouter = Router();

oauthRouter.post('/register', oauthCtrl.register);

oauthRouter.post('/activation', oauthCtrl.activateEmail);

oauthRouter.post('/login', oauthCtrl.login);

oauthRouter.post('/logout', oauthCtrl.logout);

oauthRouter.post('/google_login', oauthCtrl.googleLogin);

oauthRouter.get('/eu_cookie', oauthCtrl.getEUCookie);

oauthRouter.post('/eu_cookie', oauthCtrl.saveEUCookie);

oauthRouter.get('/send_verification_email', auth, oauthCtrl.sendVerificationEmail);

export default oauthRouter;
