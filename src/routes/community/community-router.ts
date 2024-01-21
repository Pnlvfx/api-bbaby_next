import { Router } from 'express';
import auth from '../../middleware/auth';
import communityCtrl from './community-ctrl';

const communityRouter = Router();

communityRouter.get('/', communityCtrl.getCommunities);

communityRouter.get('/:name', communityCtrl.getCommunity);

communityRouter.post('/', auth, communityCtrl.createCommunity);

communityRouter.post('/:name/change_avatar', auth, communityCtrl.changeAvatar);

communityRouter.post('/edit/description', auth, communityCtrl.updateDescription);

communityRouter.post('/subscribe', auth, communityCtrl.subscribe);

communityRouter.get('/user/pref', auth, communityCtrl.getUserPreferredCommunities);

communityRouter.post('/:name/category', auth, communityCtrl.chooseCategory);

communityRouter.post('/search', auth, communityCtrl.searchCommunity);

export default communityRouter;
