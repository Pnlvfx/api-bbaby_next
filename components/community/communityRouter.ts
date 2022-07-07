import express from 'express'
import communityCtrl from './communityCtrl'

const communityRouter = express.Router()

communityRouter.post('/communities', communityCtrl.createCommunity)

communityRouter.get('/communities', communityCtrl.getCommunities)

communityRouter.get('/best-communities', communityCtrl.getBestCommunities)

communityRouter.get('/communities/:name', communityCtrl.getCommunity)

export default communityRouter