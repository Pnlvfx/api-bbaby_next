import express from 'express'
import communityCtrl from './communityCtrl'

const communityRouter = express.Router()

communityRouter.post('/communities', communityCtrl.createCommunity)

communityRouter.get('/communities/:name', communityCtrl.getCommunity)

communityRouter.post('/communities/:name/change_avatar', communityCtrl.changeAvatar)

communityRouter.post('/communities/edit/description', communityCtrl.updateDescription)

communityRouter.get('/best-communities', communityCtrl.getBestCommunities)

communityRouter.post('/communities/subscribe', communityCtrl.subscribe)

communityRouter.get('/communities/user/pref', communityCtrl.getUserPreferredCommunities)

communityRouter.post('/communities/:name/category', communityCtrl.chooseCategory)

communityRouter.post('/communities/search', communityCtrl.searchCommunity)

export default communityRouter;