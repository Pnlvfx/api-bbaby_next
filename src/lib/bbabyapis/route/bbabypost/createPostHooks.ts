import { PostProps } from "../../../../@types/post";
import { IUser } from "../../../../models/types/user";
import config from '../../../../config/config';
import { TwitterApi } from "twitter-api-v2";
import { catchError } from "../../../../coraline/cor-route/crlerror";
import { CommunityProps } from "../../../../@types/community";
import coraline from "../../../../coraline/coraline";
import twitterapis from "../../../twitterapis/twitterapis";

const chooseUser = (user: IUser, post: PostProps, language: 'it' | 'en') => {
  try {
    const twitter = user?.tokens?.find((provider) => provider.provider === 'twitter');
    if (!twitter) throw new Error('You need to authorize the twitter API in the User Settings page.');
    const { oauth_access_token, oauth_access_token_secret } = twitter;
    const accessToken =
      user.role === 0
        ? oauth_access_token
        : post.community === 'Italy'
        ? config.ANON_ACCESS_TOKEN
        : language === 'it'
        ? config.BBABYITALIA_ACCESS_TOKEN
        : config.BBABY_ACCESS_TOKEN;
    const accessSecret =
      user.role === 0
        ? oauth_access_token_secret
        : post.community === 'Italy'
        ? config.ANON_ACCESS_TOKEN_SECRET
        : language === 'it'
        ? config.BBABYITALIA_ACCESS_TOKEN_SECRET
        : config.BBABY_ACCESS_TOKEN_SECRET;
    if (!oauth_access_token) throw new Error('You need to access to your twitter account first');
    const twitterClient = new TwitterApi({
      appKey: config.TWITTER_CONSUMER_KEY,
      appSecret: config.TWITTER_CONSUMER_SECRET,
      accessToken,
      accessSecret,
    });
    return twitterClient;
  } catch (err) {
    throw catchError(err);
  }
};

export const shareToTwitter = async (
  savedPost: PostProps,
  url: string,
  user: IUser,
  communityInfo: CommunityProps,
  isImage?: boolean,
  isVideo?: boolean,
  selectedFile?: string,
) => {
  try {
    const govText = savedPost.title.substring(0, 300 - url.length - 10) + ' ' + url;
    const twitterText = user.role === 0 ? url : govText;
    const twitterUser = chooseUser(user, savedPost, communityInfo.language);
    if (user.role === 1) {
      if (isImage || isVideo) {
        if (!selectedFile) throw new Error('Missing the media parameter!');
        const type = isImage ? 'images' : 'videos';
        const video = isVideo ? selectedFile?.toString().split('?')[0] : null;
        const isUrl = type === 'images' ? coraline.media.urlisImage(selectedFile) : coraline.media.urlisVideo(video as string);
        const public_id = `posts/${savedPost._id.toString()}`;
        const media = isUrl ? await coraline.media.getMediaFromUrl(selectedFile, public_id, type) : { filename: selectedFile };
        const twimage = await twitterapis.uploadMedia(twitterUser, isUrl ? media.filename : Buffer.from(media.filename));
        await twitterapis.tweet(twitterUser, twitterText, twimage);
      } else {
        await twitterapis.tweet(twitterUser, twitterText);
      }
    } else {
      await twitterapis.tweet(twitterUser, twitterText);
    }
  } catch (err) {
    savedPost.delete();
    throw catchError(err);
  }
};
