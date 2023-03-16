import { catchError, catchErrorWithTelegram } from '../../../coraline/cor-route/crlerror';
import twitterapis from '../../twitterapis/twitterapis';
import coraline from '../../../coraline/coraline';
import { TweetV2 } from 'twitter-api-v2';
import googleapis from '../../googleapis/googleapis';
import bbabyapis from '../bbabyapis';
const start_time = new Date().toISOString();

const useAImentions = async () => {
  try {
    console.log('New twitter request');
    const client = await twitterapis.getMyClient('bbabyita');
    const me = await client.v2.me();
    const mentions = await client.v2.userMentionTimeline(me.data.id, {
      expansions: ['author_id'],
      'tweet.fields': ['referenced_tweets'],
      'user.fields': ['username'],
      start_time,
    });
    if (!mentions.data.data) return;
    const filename = `${coraline.use('tmp/twitter')}/mentions.json`;
    const alreadySent = (await coraline.readJSON(filename)) as TweetV2['id'][];
    const filtered = mentions.data.data.filter((t) => !alreadySent.find((t2) => t2 === t.id));
    await Promise.all(
      filtered.map(async (tweet) => {
        try {
          const originalId = tweet.referenced_tweets ? tweet.referenced_tweets[0].id : undefined;
          if (!originalId) throw new Error('Missing original Id for this mentions!');
          const originalTweet = await client.v2.singleTweet(originalId);
          const language = await googleapis.detectLanguage(originalTweet.data.text);
          const s = language === 'it' ? 'Che ne pensi in massimo 250 lettere?' : 'What do you think about this in maximum 250 words?';
          const prompt = `${s} ${originalTweet.data.text}`;
          let aitext = await bbabyapis.AIrequest(prompt);
          if (aitext.length >= 300) {
            const u = language === 'it' ? 'Riassumi questo messaggio in massimo 250 lettere!' : 'Summarize this message in up to 250 letters';
            aitext = await bbabyapis.AIrequest(`${u} ${aitext}`);
          }
          await client.v2.tweet(aitext, {
            reply: {
              in_reply_to_tweet_id: tweet.id,
            },
          });
          alreadySent.push(tweet.id);
          await coraline.saveFile(filename, alreadySent);
          const user = mentions.data.includes?.users?.find((u) => u.id === tweet.author_id);
          if (!user) return;
          await coraline.sendLog(`New tweet reply: https://twitter.com/${user.username}/status/${tweet.id}`);
        } catch (err) {
          throw catchError(err, 'Twitter mentions!');
        }
      }),
    );
  } catch (err) {
    catchErrorWithTelegram(err);
  }
};

export const useTwitterMentions = (minutesInterval: number) => {
  const filename = `${coraline.use('tmp/twitter')}/mentions.json`;
  coraline.saveFile(filename, []);
  setInterval(useAImentions, minutesInterval * 60 * 1000);
};
