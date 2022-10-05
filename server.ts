import express from 'express';
import config from './config/config';
import useragent from 'express-useragent';
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
import governance from './middleware/governance';
import contentType from './middleware/contentType';
import videoRouter from './bbaby_static/videoRouter';
import coraline from './database/coraline';
import analyticsRouter from './components/analytics/analyticsRouter';
import imageRouter from './bbaby_static/images/imageRouter';
const {MONGO_URI} = config;

const app = express();

app.use(contentType)
app.use(useragent.express())
app.use(cookieParser());
app.use(express.urlencoded({extended: true}))
app.use(express.json({limit: '50mb'}))
app.use(compression());
app.use(cors({origin: corsOrigin, credentials: true}));
const db = config.NODE_ENV === 'production' ? MONGO_URI : 'mongodb://localhost:27017'; // local;
const imagePath = coraline.use('images');
const youtubePath = coraline.use('youtube');
connect(db).then((res) => {
    console.log("Successfully connected to bbabystyle database!")
}).catch(error => new Error(`Cannot connect to bbabystyle database: ${error}`))


app.get('/', (req, res) => {
    res.send('This is Bbabystyle API');
});

app.get('/sitemaps', async (req,res) => {
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
});

app.use('/analytics', analyticsRouter);

app.use('/images/favicon', express.static(`${imagePath}/favicon`));

app.use('/images/icons', express.static(`${imagePath}/icons`));

app.use('/gov/youtube', express.static(youtubePath))

app.use('/images', imageRouter);

app.use('/videos', videoRouter);

app.use('/', oauthRouter);

app.use('/user', userRouter);

app.use('/posts', postRouter);

app.use('/communities', communityRouter);

app.use('/comments', commentRouter);

app.use('/search', searchRouter);

app.use('/categories', categoryRouter);

app.use('/news', newsRouter);

app.use('/twitter', auth,  twitterRouter)

app.use('/reddit', auth,  redditRouter);

app.use('/governance', auth, governance, governanceRouter);

console.log('ok lets go')

app.listen(4000)