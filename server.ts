import express from 'express'
import config from './config/config'
import bodyParser from 'body-parser'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import compression from 'compression'
import mongoose from 'mongoose'
import postRouter from './components/post/postRouter'
import userRouter from './components/user/userRouter'
import governanceRouter from './components/governance/governanceRouter'
import communityRouter from './components/community/communityRouter'
import twitterRouter from './components/twitter/twitterRouter'
import commentRouter from './components/comment/commentRouter'
import Post from './models/Post'
import searchRouter from './components/search/searchRouter'
import categoryRouter from './components/category/categoryRouter'

const {CLIENT_URL,CORS_ORIGIN1,CORS_ORIGIN2,MONGO_URI} = config
const app = express()
app.use(cookieParser())
app.use(bodyParser.urlencoded({extended:true}))
app.use(bodyParser.json({limit: '50mb'}))
app.use(compression())
app.use(cors({
    origin: [CLIENT_URL,CORS_ORIGIN1,CORS_ORIGIN2],
    credentials:true
}))

mongoose.connect(MONGO_URI).catch(error => console.log(`Cannot connect to bbabystyle database: ${error}`))

app.use('/', postRouter)

app.use('/', userRouter)

app.use('/', communityRouter)

app.use('/', governanceRouter)

app.use('/', twitterRouter)

app.use('/', commentRouter)

app.use('/', searchRouter)

app.use('/', categoryRouter);

app.get('/', (req, res) => {
    res.send('This is Bbabystyle API');
});

app.get('/sitemaps', async(req,res) => {
    try {
        const posts = await Post.find({}).sort({createdAt: -1})
        if(!posts) return res.status(500).json({msg: "For some reason we are not able to provide you this sitemaps, we will try to fix the problem as soon as possible"})
        res.json(posts)   
    } catch (err) {
        if (err instanceof Error)
        res.status(500).json({msg: err.message})
    }
})

const port = 4000

const server = app.listen(port)