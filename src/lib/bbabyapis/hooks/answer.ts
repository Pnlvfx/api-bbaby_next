import { catchError, catchErrorWithTelegram } from '../../../coraline/cor-route/crlerror';
import coraline from '../../../coraline/coraline';
import Community from '../../../models/Community';
import User from '../../../models/User';
import openaiapis from '../../openaiapis/openaiapis';
import bbabyapis from '../bbabyapis';

const communities = ['React', 'Nodejs', 'Express', 'Nextjs', 'History', 'Webdev'];

export const answer = async (prompt?: string) => {
  try {
    const community = communities[coraline.getRandomInt(communities.length - 1)];
    const check = await Community.exists({
      name: new RegExp(`^${community}$`, 'i'),
    });
    if (!check) {
      const owner = await User.findOne({ is_bot: true });
      if (!owner) throw new Error('bbabyapis, missing owner in answer function!');
      await bbabyapis.community.createCommunity(owner, community);
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
        await bbabyapis.comment.createComment(user, body, post._id, post._id);
      } catch (err) {
        catchErrorWithTelegram(err);
      }
    }, 50 * 60 * 1000);
  } catch (err) {
    throw catchError(err);
  }
};
