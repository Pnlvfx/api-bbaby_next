import { CommunityProps } from '../../@types/community';
import { PostProps } from '../../@types/post';
import { IUser } from '../../@types/user';
import coraline from '../../coraline/coraline';
import { catchError } from '../../lib/common';
import twitterapis from '../../lib/twitterapis';

const postapis = {
  shareToTwitter: async (
    savedPost: PostProps,
    url: string,
    user: IUser,
    communityInfo: CommunityProps,
    isImage: boolean,
    isVideo: boolean,
    selectedFile: any,
  ) => {
    try {
      const govText = savedPost.title.substring(0, 300 - url.length - 10) + ' ' + url;
      const twitterText = user.role === 0 ? url : govText;
      if (!communityInfo.language) throw new Error("This community doesn't have a language");
      const twitterUser = twitterapis.chooseUser(user, savedPost, communityInfo.language);
      if (user.role === 1) {
        if (isImage || isVideo) {
          const type = isImage ? 'images' : 'videos';
          const video = isVideo ? selectedFile.toString().split('?')[0] : null;
          const isUrl = type === 'images' ? coraline.media.urlisImage(selectedFile) : coraline.media.urlisVideo(video);
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
  },
};

export default postapis;
