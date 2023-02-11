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
import generalRouter from './components/general/generalRouter';
import { catchErrorCtrl } from './coraline/cor-route/crlerror';
import News from './models/News';

const app = express();

app.use(contentType);
app.use(useragent.express());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(express.json({ limit: '50mb' }));
app.use(compression());
app.use(cors({ origin: [config.CLIENT_URL, 'https://new.bbabystyle.com'], credentials: true }));
const staticPath = coraline.useStatic();

bbabyapis.initialize();

app.get('/', (req, res) => {
  res.send('This is bbabystyle API');
});

app.get('/sitemaps', async (req, res) => {
  try {
    const { type } = req.query;
    if (!type) return res.status(400).json({ msg: 'Invalid request!' });
    if (type === 'post') {
      const posts = await Post.find({}).sort({ createdAt: -1 });
      res.status(200).json(posts);
    } else if (type === 'community') {
      const communities = await Community.find({});
      res.status(200).json(communities);
    } else if (type === 'news') {
      const news = await News.find({});
      res.status(200).json(news);
    } else {
      res.status(400).json({ msg: 'Invalid type!' });
    }
  } catch (err) {
    catchErrorCtrl(err, res);
  }
});

app.use('/static', express.static(staticPath));

app.use('/', telegramRouter);

app.use('/analytics', analyticsRouter);

app.use('/images', imageRouter);

app.use('/videos', videoRouter);

app.use('/', oauthRouter);

app.use('/', generalRouter);

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
