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
import redditRouter from './components/reddit/redditRouter';
import oauthRouter from './components/oauth/oauthRouter';
import auth from './middleware/auth';

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

app.get('/', (req, res) => {
    res.send('This is Bbabystyle API');
});

app.use('/', oauthRouter)

app.use('/user', userRouter)

app.use('/posts', postRouter)

app.use('/communities', communityRouter)

app.use('/governance', governanceRouter)

app.use('/comments', commentRouter)

app.use('/search', searchRouter)

app.use('/categories', categoryRouter);

app.use('/news', newsRouter);

app.use('/twitter', twitterRouter)

app.use('/reddit', auth, redditRouter);

app.use('/', express.static('public'))

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