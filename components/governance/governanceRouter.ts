import express from 'express'
import youtubeCtrl from '../youtube/youtubeCtrl'
import governanceCtrl from './governanceCtrl'

const governanceRouter = express.Router()

governanceRouter.post('/governance/create-image', governanceCtrl.createImage)

governanceRouter.post('/governance/create-video', governanceCtrl.createVideo)

governanceRouter.get('/governance/youtube/login', youtubeCtrl.login)

//governanceRouter.post('/governance/youtube/access_token', governanceCtrl.youtubeAccessToken)

governanceRouter.post('/governance/youtube', governanceCtrl.uploadYoutube)

governanceRouter.post('/governance/translate-tweet', governanceCtrl.translateTweet)

export default governanceRouter