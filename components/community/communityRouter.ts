import {Router} from 'express';
import auth from '../../middleware/auth';
import communityCtrl from './communityCtrl';

const communityRouter = Router()

communityRouter.get('/best-communities', communityCtrl.getBestCommunities)

communityRouter.get('/:name', communityCtrl.getCommunity)
communityRouter.post('/edit/description', communityCtrl.updateDescription)

communityRouter.use(auth);

communityRouter.post('/', communityCtrl.createCommunity);

communityRouter.post('/:name/change_avatar', communityCtrl.changeAvatar)

communityRouter.post('/subscribe', communityCtrl.subscribe)

communityRouter.get('/user/pref', communityCtrl.getUserPreferredCommunities)

communityRouter.post('/:name/category', communityCtrl.chooseCategory)

communityRouter.post('/search', communityCtrl.searchCommunity)

export default communityRouter;