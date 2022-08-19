import express from 'express';
import config from './config/config';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import compression from 'compression';
import {connect} from 'mongoose';
import postRouter from './components/post/postRouter';
import userRouter from './components/user/userRouter';
import governanceRouter from './components/governance/governanceRouter';
import communityRouter from './components/community/communityRouter';
import twitterRouter from './components/twitter/twitterRouter';
import commentRouter from './components/comment/commentRouter';
import Post from './models/Post';
import searchRouter from './components/search/searchRouter';
import categoryRouter from './components/category/categoryRouter';
import newsRouter from './components/news/newsRouter';
import Community from './models/Community';
import { corsOrigin } from './lib/APIaccess';

const {MONGO_URI} = config;
const app = express()
app.use(cookieParser())
app.use(bodyParser.urlencoded({extended:true}))
app.use(bodyParser.json({limit: '50mb'}))
app.use(compression())
app.use(cors({
    origin: corsOrigin(),
    credentials:true
}))

connect(MONGO_URI).catch(error => console.log(`Cannot connect to bbabystyle database: ${error}`))

app.use('/', postRouter)

app.use('/', userRouter)

app.use('/', communityRouter)

app.use('/', governanceRouter)

app.use('/', twitterRouter)

app.use('/', commentRouter)

app.use('/', searchRouter)

app.use('/', categoryRouter);

app.use('/', newsRouter);

app.get('/', (req, res) => {
    res.send('This is Bbabystyle API');
});

app.use(express.static('public'))

app.get('/sitemaps', async(req,res) => {
    try {
        const {type} = req.query;
        if (!type) {
            const posts = await Post.find({}).sort({createdAt: -1})
            res.status(200).json(posts)
        } else {
            const communities = await Community.find({})
            res.status(200).json(communities)
        }
    } catch (err) {
        if (err instanceof Error)
        res.status(500).json({msg: err.message})
    }
})

const port = 4000

const server = app.listen(port)