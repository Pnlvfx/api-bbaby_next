import config from './config/config';
import express from 'express';
import useragent from 'express-useragent';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import compression from 'compression';
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
import redditRouter from './components/reddit/redditRouter';
import oauthRouter from './components/oauth/oauthRouter';
import auth from './middleware/auth';
import governance from './middleware/governance';
import contentType from './middleware/contentType';
import videoRouter from './bbaby_static/videoRouter';
import coraline from './coraline/coraline';
import analyticsRouter from './components/analytics/analyticsRouter';
import imageRouter from './bbaby_static/images/imageRouter';
import bbabyapis from './lib/bbabyapis/bbabyapis';
import telegramRouter from './components/telegram/telegramRouter';
import bbcapis from './lib/bbcapis/bbcapis';
import { BBCInfo } from './lib/bbcapis/types/bbctype';

const app = express();

app.use(contentType);
app.use(useragent.express());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(express.json({ limit: '50mb' }));
app.use(compression());
app.use(cors({ origin: config.CLIENT_URL, credentials: true }));
const staticPath = coraline.useStatic();

bbabyapis.initialize();

const test = async () => {
  try {
    const news = {
      title: 'dsvdogjdfogg',
      description: 'sdfdsjfisfgigfdgfdgdfg'
    }
    const post = await bbcapis.toTweet(news as BBCInfo)
    setTimeout(() => {
      Post.deleteOne({_id: post._id})
    }, 120000)
  } catch (err) {
    
  }
}

test()

app.get('/', (req, res) => {
  res.send('This is bbabystyle API');
});

app.get('/sitemaps', async (req, res) => {
  try {
    const { type } = req.query;
    if (!type) {
      const posts = await Post.find({}).sort({ createdAt: -1 });
      res.status(200).json(posts);
    } else {
      const communities = await Community.find({});
      res.status(200).json(communities);
    }
  } catch (err) {
    if (err instanceof Error) res.status(500).json({ msg: err.message });
  }
});

app.use('/static', express.static(staticPath));

app.use('/', telegramRouter);

app.use('/analytics', analyticsRouter);

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

app.use('/twitter', auth, twitterRouter);

app.use('/reddit', auth, redditRouter);

app.use('/governance', auth, governance, governanceRouter);

app.listen(4000);
