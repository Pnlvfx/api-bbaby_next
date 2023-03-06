// import { ETwitterStreamEvent, TwitterApi } from 'twitter-api-v2';
// import config from '../../../config/config';
import { catchErrorWithTelegram } from '../../../coraline/cor-route/crlerror';
import twitterapis from '../../twitterapis/twitterapis';
import openaiapis from '../../openaiapis/openaiapis';
import coraline from '../../../coraline/coraline';
import { TweetV2 } from 'twitter-api-v2';
import googleapis from '../../googleapis/googleapis';
const start_time = new Date().toISOString();
const alreadySent: TweetV2['id'][] = [];

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
      expansions: ['author_id'],
      'tweet.fields': ['referenced_tweets'],
      'user.fields': ['username'],
      start_time,
    });
    if (!mentions.data.data) return;
    const filtered = mentions.data.data.filter((t) => !alreadySent.find((t2) => t2 === t.id));
    await Promise.all(
      filtered.map(async (tweet) => {
        try {
          const mentionId = tweet.referenced_tweets ? tweet.referenced_tweets[0].id : undefined;
          if (!mentionId) return;
          const originalTweet = await client.v2.singleTweet(mentionId);
          const language = await googleapis.detectLanguage(originalTweet.data.text);
          const s = language === 'it' ? 'Che ne pensi in massimo 270 lettere?' : 'What do you think about this in maximum 270 word?';
          const prompt = `${s} ${originalTweet.data.text}`;
          const aitext = await openaiapis.request(prompt);
          if (aitext.length >= 300) return;
          await client.v2.tweet(aitext, {
            reply: {
              in_reply_to_tweet_id: tweet.id,
            },
          });
          alreadySent.push(tweet.id);
          const username = mentions.data.includes?.users?.find((u) => u.id === tweet.author_id);
          await coraline.sendLog(`New tweet reply: https://twitter.com/${username}/status/${tweet.id}`);
        } catch (err) {
          catchErrorWithTelegram(err);
        }
      }),
    );
  } catch (err) {
    catchErrorWithTelegram(err);
  }
};

export const useTwitter = async () => {
  setInterval(useAImentions, 10 * 60 * 1000);
  //setInterval(sendTweet, 2 * 60 * 1000);
};
