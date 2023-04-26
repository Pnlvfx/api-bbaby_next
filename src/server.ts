import config from './config/config';
import express from 'express';
import useragent from 'express-useragent';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import compression from 'compression';
import postRouter from './routes/post/postRouter';
import userRouter from './routes/user/userRouter';
import governanceRouter from './routes/governance/governanceRouter';
import communityRouter from './routes/community/communityRouter';
import twitterRouter from './routes/twitter/twitterRouter';
import commentRouter from './routes/comment/commentRouter';
import searchRouter from './routes/search/searchRouter';
import categoryRouter from './routes/category/categoryRouter';
import newsRouter from './routes/news/newsRouter';
import redditRouter from './routes/reddit/redditRouter';
import oauthRouter from './routes/oauth/oauthRouter';
import auth from './middleware/auth';
import contentType from './middleware/contentType';
import videoRouter from './bbaby_static/videoRouter';
import coraline from './coraline/coraline';
import analyticsRouter from './routes/analytics/analyticsRouter';
import imageRouter from './bbaby_static/images/imageRouter';
import bbabyapis from './lib/bbabyapis/bbabyapis';
import telegramRouter from './routes/telegram/telegramRouter';
import generalRouter from './routes/general/generalRouter';
import sitemapRouter from './routes/sitemap/sitemapRouter';
import tiktokRouter from './routes/tiktok/tiktokRouter';
import validationRouter from './lib/userapis/validationRouter';
const app = express();

app.use(contentType);
app.use(useragent.express());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(express.json({ limit: '50mb' }));
app.use(compression());
app.use(cors({ origin: config.CLIENT_URL, credentials: true }));
app.set('trust proxy', true);

bbabyapis.initialize();

app.get('/', (req, res) => {
  res.send('Welcome to bbabystyle api');
});

app.use('/', oauthRouter);

app.use('/', validationRouter);

app.use('/', generalRouter);

app.use('/', telegramRouter);

app.use('/static', express.static(coraline.useStatic()));

app.use('/sitemaps', sitemapRouter);

app.use('/analytics', analyticsRouter);

app.use('/images', imageRouter);

app.use('/videos', videoRouter);

app.use('/user', userRouter);

app.use('/posts', postRouter);

app.use('/communities', communityRouter);

app.use('/comments', commentRouter);

app.use('/search', searchRouter);

app.use('/categories', categoryRouter);

app.use('/news', newsRouter);

app.use('/twitter', auth, twitterRouter);

app.use('/reddit', auth, redditRouter);

app.use('/governance', auth, governanceRouter);

app.use('/tiktok', auth, tiktokRouter);

app.listen(4000);
