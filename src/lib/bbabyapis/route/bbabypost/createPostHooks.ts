import { IUser } from '../../../../models/types/user';
import { catchError } from '../../../../coraline/cor-route/crlerror';
import coraline from '../../../../coraline/coraline';
import twitterapis from '../../../twitterapis/twitterapis';
import { PostProps } from '../../../../models/types/post';
import { CommunityProps } from '../../../../models/types/community';

const chooseUser = async (user: IUser, post: PostProps, language: 'it' | 'en') => {
  try {
    let client;
    if (user.role === 0) {
      //v2
      const twitter = user?.tokens?.find((provider) => provider.provider === 'twitter');
      if (!twitter) throw new Error('You need to authorize the twitter API in the User Settings page.');
      client = await twitterapis.v2.getUserClient(twitter, user);
    } else if (post.community === 'Italy') {
      client = await twitterapis.getMyClient('anonynewsitaly');
    } else if (language === 'it') {
      client = await twitterapis.getMyClient('bbabystyle');
    } else {
      client = await twitterapis.getMyClient('bugstransfer');
    }
    return client;
  } catch (err) {
    throw catchError(err);
  }
};

export const shareToTwitter = async (
  post: PostProps,
  url: string,
  user: IUser,
  communityInfo: CommunityProps,
  isImage?: boolean,
  isVideo?: boolean,
  selectedFile?: string,
) => {
  try {
    //const govText = savedPost.title.substring(0, 300 - url.length - 8) + ' ' + url;
    const govText = post.title.substring(0, 280);
    const twitterText = user.role === 0 ? url : govText;
    const twitterUser = await chooseUser(user, post, communityInfo.language);
    if (user.role === 1) {
      if (isImage || isVideo) {
        if (!selectedFile) throw new Error('Missing the media parameter!');
        const type = isImage ? 'images' : 'videos';
        const video = isVideo ? selectedFile?.toString().split('?')[0] : null;
        const isUrl = type === 'images' ? coraline.media.urlisImage(selectedFile) : coraline.media.urlisVideo(video as string);
        const public_id = `posts/${post._id.toString()}`;
        const media = isUrl ? await coraline.media.getMediaFromUrl(selectedFile, public_id, type) : { filename: selectedFile };
        const twimage = await twitterUser.v1.uploadMedia(isUrl ? media.filename : Buffer.from(media.filename));
        await twitterUser.v1.tweet(twitterText, { media_ids: twimage });
      } else {
        await twitterUser.v1.tweet(twitterText);
      }
    } else {
      await twitterUser.v2.tweet(twitterText);
    }
  } catch (err) {
    post.deleteOne();
    throw catchError(err);
  }
};
