// import { ETwitterStreamEvent, TwitterApi } from 'twitter-api-v2';
// import config from '../../../config/config';
import { catchError, catchErrorWithTelegram } from '../../../coraline/cor-route/crlerror';
import twitterapis from '../../twitterapis/twitterapis';
import openaiapis from '../../openaiapis/openaiapis';
import coraline from '../../../coraline/coraline';
const start_time = new Date().toISOString();

// const useStream = async () => {
//   try {
//     const client = new TwitterApi(config.TWITTER_BEARER_TOKEN);
//     const stream = await client.v2.sampleStream({
//       expansions: ['author_id'],
//       'user.fields': ['username'],
//       'tweet.fields': ['text', 'entities', 'public_metrics'],
//     });
//     stream.on(ETwitterStreamEvent.Connected, () => {
//       console.log('connected');
//     });
//     stream.on(ETwitterStreamEvent.ConnectionError, (err) => {
//       console.log(err, 'Connection Error');
//     });
//     stream.on(ETwitterStreamEvent.ConnectionClosed, () => {
//       console.log('Connection has been closed.');
//     });
//     stream.on(ETwitterStreamEvent.Data, (data) => {
//       if (data.data.public_metrics?.like_count && data.data.public_metrics.like_count > 1000) {
//         console.log(data);
//       }
//     });
//     stream.on(ETwitterStreamEvent.DataKeepAlive, () => console.log('Twitter has a keep-alive packet.'));
//   } catch (err) {
//     throw catchError(err);
//   }
// };

const useAImentions = async () => {
  try {
    const client = await twitterapis.getMyClient('bbabyita');
    const me = await client.v2.me();
    const mentions = await client.v2.userMentionTimeline(me.data.id, {
      'tweet.fields': ['referenced_tweets'],
      start_time,
    });
    const originalId = mentions.tweets.length > 0 && mentions.tweets[0].referenced_tweets ? mentions.tweets[0].referenced_tweets[0].id : undefined;
    if (!originalId) return;
    const originalTweet = await client.v2.singleTweet(originalId);
    const aitext = await openaiapis.request(`Che ne pensi di: ${originalTweet.data.text}?`);
    await client.v2.tweet(aitext, {
      reply: {
        in_reply_to_tweet_id: originalId,
      },
    });
    await coraline.sendLog(`new tweet reply to :${originalTweet.data.text}, with ${aitext}`);
  } catch (err) {
    catchErrorWithTelegram(err);
  }
};

export const useTwitter = async () => {
  try {
    // await useStream();
    setInterval(useAImentions, 20 * 60 * 1000);
  } catch (err) {
    throw catchError(err);
  }
  //setInterval(sendTweet, 2 * 60 * 1000);
};
