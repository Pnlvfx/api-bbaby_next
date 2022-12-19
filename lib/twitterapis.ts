import { IUser } from "../@types/user";
import { catchError } from "./common";
import {TUploadableMedia, TwitterApi} from 'twitter-api-v2';
import config from '../config/config';
import { PostProps } from "../@types/post";

const {
    TWITTER_CONSUMER_KEY,
    TWITTER_CONSUMER_SECRET,
    ANON_ACCESS_TOKEN,
    ANON_ACCESS_TOKEN_SECRET,
    BBABYITALIA_ACCESS_TOKEN, 
    BBABYITALIA_ACCESS_TOKEN_SECRET,
    BBABY_ACCESS_TOKEN,
    BBABY_ACCESS_TOKEN_SECRET
} = config;

const twitterapis = {
    uploadMedia: async (client: TwitterApi, media: TUploadableMedia) => {
        try {
            // const stats = fs.statSync(media);
            // const size = stats.size / (1024*1024)
            const mediaId = await client.v1.uploadMedia(media);
            return mediaId;
        } catch (err) {
            throw catchError(err);
        }
    },
    chooseUser: (
        user: IUser,
        post: PostProps,
        language: 'it' | 'en'
    ) => {
        try {
            const twitter = user?.tokens?.find((provider) => provider.provider === 'twitter');
            if (!twitter) throw new Error("You need to authorize the twitter API in the User Settings page.");
            const {oauth_access_token, oauth_access_token_secret} = twitter
            const accessToken = user.role === 0
            ? oauth_access_token : post.community === 'Italy'
            ? ANON_ACCESS_TOKEN : language === 'it' 
            ? BBABYITALIA_ACCESS_TOKEN : BBABY_ACCESS_TOKEN
            const accessSecret = user.role === 0
            ? oauth_access_token_secret : post.community === 'Italy'
            ? ANON_ACCESS_TOKEN_SECRET : language === 'it'
            ? BBABYITALIA_ACCESS_TOKEN_SECRET : BBABY_ACCESS_TOKEN_SECRET
            if (!oauth_access_token) throw new Error('You need to access to your twitter account first');
            const twitterClient = new TwitterApi({
                appKey: TWITTER_CONSUMER_KEY,
                appSecret: TWITTER_CONSUMER_SECRET,
                accessToken,
                accessSecret
            });
            return twitterClient;
        } catch (err) {
            throw catchError(err);
        }
    },
    tweet: async (
        client: TwitterApi,
        text: string,
        mediaId?: string,
        ) => {
        try {
            let response = undefined;
            if (text.length > 300) throw new Error(`Twitter maximum accept maximum 300 words. Please consider making this tweet shorter!`)
            if (mediaId) {
                response = await client.v1.tweet(text, {media_ids: mediaId});
            } else {
                response = await client.v1.tweet(text);
            }
            if (!response) throw new Error("Something went wrong during the upload on twitter");
            return 'ok';
        } catch (err) {
            throw catchError(err)
        }
    }
}

export default twitterapis;