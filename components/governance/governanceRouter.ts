import express from 'express'
import governanceCtrl from './governanceCtrl'

const governanceRouter = express.Router()

governanceRouter.post('/governance/create-image', governanceCtrl.createImage)

governanceRouter.post('/governance/create-video', governanceCtrl.createVideo)

governanceRouter.post('/governance/youtube', governanceCtrl.uploadYoutube)

export default governanceRouter