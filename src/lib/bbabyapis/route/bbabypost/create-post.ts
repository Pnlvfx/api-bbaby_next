import { IUser } from '../../../../models/types/user';
import twitterapis from '../../../twitterapis/twitterapis';
import { PostProps } from '../../../../models/types/post';
import coraline from 'coraline';

const chooseUser = (user: IUser) => {
  const twitter = user?.tokens?.find((provider) => provider.provider === 'twitter');
  if (!twitter) throw new Error('You need to authorize the twitter API in the User Settings page.');
  return twitterapis.v2.getUserClient(twitter, user);
};

export const shareToTwitter = async (post: PostProps, url: string, user: IUser, isImage?: boolean, isVideo?: boolean, selectedFile?: string) => {
  try {
    const govText = `${post.title.slice(0, 279 - url.length)} ${url}`;
    // const govText = post.title.length >= 279 ? govTextUrl : post.title;
    const twitterText = user.role === 0 ? url : govText;
    const twitterUser = await chooseUser(user);
    if (user.role === 1) {
      if (isImage || isVideo) {
        if (!selectedFile) throw new Error('Missing the media parameter!');
        const isUrl = coraline.media.urlisMedia(selectedFile.split('?')[0]);
        let media_id: string;
        if (isUrl) {
          const public_id = `posts/${post._id.toString()}`;
          const media = await coraline.media.getMediaFromUrl(selectedFile, public_id, isImage ? 'images' : 'videos');
          media_id = await twitterUser.v1.uploadMedia(media.filename);
        } else {
          media_id = await twitterUser.v1.uploadMedia(Buffer.from(selectedFile));
        }
        await twitterUser.v2.tweet(twitterText, {
          media: {
            media_ids: [media_id],
          },
        });
      } else {
        await twitterUser.v2.tweet(twitterText);
      }
    } else {
      await twitterUser.v2.tweet(twitterText);
    }
  } catch (err) {
    post.deleteOne();
    throw err;
  }
};
