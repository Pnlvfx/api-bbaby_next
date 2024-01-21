import config from './config/config';
import express from 'express';
import useragent from 'express-useragent';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import compression from 'compression';
import postRouter from './routes/post/post-router';
import userRouter from './routes/user/user-router';
import governanceRouter from './routes/governance/governance-router';
import communityRouter from './routes/community/community-router';
import twitterRouter from './routes/twitter/twitter-router';
import commentRouter from './routes/comment/comment.router';
import searchRouter from './routes/search/search-router';
import categoryRouter from './routes/category/category-router';
import newsRouter from './routes/news/news-router';
import redditRouter from './routes/reddit/reddit-router';
import oauthRouter from './routes/oauth/oauth-router';
import auth from './middleware/auth';
import videoRouter from './bbaby_static/video-router';
import analyticsRouter from './routes/analytics/analytics-router';
import imageRouter from './bbaby_static/images/image-router';
import bbabyapis from './lib/bbabyapis/bbabyapis';
import generalRouter from './routes/general/general-router';
import sitemapRouter from './routes/sitemap/sitemap-router';
import tiktokRouter from './routes/tiktok/tiktok-router';
import validationRouter from './lib/userapis/validation-router';
import coraline from 'coraline';
const app = express();

const origin = config.NODE_ENV === 'production' ? ['https://www.bbabystyle.com'] : ['http://localhost:3000', 'http://192.168.1.22'];

app.use(cors({ origin, credentials: true }));
app.use(useragent.express());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(express.json({ limit: '50mb' }));
app.use(compression());
app.set('trust proxy', true);

bbabyapis.initialize();

app.get('/', (req, res) => {
  res.send('Welcome to bbabystyle api');
});

app.use('/', oauthRouter);

app.use('/', validationRouter);

app.use('/', generalRouter);

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
