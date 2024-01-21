import coraline, { errToString } from 'coraline';
import Community from '../../../models/Community';
import User from '../../../models/user';
import openaiapis from '../../openaiapis/openaiapis';
import bbabyapis from '../bbabyapis';
import bbabycomment from '../route/bbabycomment/bbabycomment';
import bbabycommunity from '../route/bbabycommunity/bbabycommunity';
import { sendLog } from '../../telegram';

const communities = ['React', 'Nodejs', 'Express', 'Nextjs', 'History', 'Webdev'];

export const answer = async (prompt?: string) => {
  const community = communities[coraline.getRandomInt(communities.length - 1)];
  const check = await Community.exists({ name: coraline.regex.upperLowerCase(community) });
  if (!check) {
    const owner = await User.findOne({ is_bot: true });
    if (!owner) throw new Error('Bbabyapis, missing owner in answer function!');
    await bbabycommunity.createCommunity(owner, community);
  }
  prompt = prompt || `Ask me something about ${community} without writing the response!`; //important;
  const user = await bbabyapis.AIuser();
  const post = await bbabyapis.AIpost(user, prompt, community);
  if (!post) return;
  setTimeout(async () => {
    try {
      let user = await User.findOne({
        is_bot: true,
        username: { $ne: post.author },
      });
      if (!user) {
        user = await bbabyapis.newBot();
      }
      const body = await openaiapis.request(post.title);
      await bbabycomment.createComment(user, body, post._id, post._id);
    } catch (err) {
      sendLog(errToString(err));
    }
  }, 50 * 60 * 1000);
};
