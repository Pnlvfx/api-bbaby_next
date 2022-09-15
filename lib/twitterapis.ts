import { IUser } from "../@types/user";
import { catchError } from "./common";
import {TwitterApi} from 'twitter-api-v2';
import config from '../config/config';
import fs from 'fs';
import { Document, Types } from "mongoose";
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
    uploadMedia: async (user: IUser, savedPost: Document<unknown, any, PostProps> & PostProps & {
        _id: Types.ObjectId;
    }, media: string) => {
        try {
            const twitter = user?.tokens?.find((provider) => provider.provider === 'twitter');
            if (!twitter) throw new Error("You need to authorize the twitter API into the User Settings page.");
            const {oauth_access_token, oauth_access_token_secret} = twitter
            const accessToken = user.role === 0 ? oauth_access_token : savedPost.community === 'Italy' ? ANON_ACCESS_TOKEN : savedPost.community === 'calciomercato' ? BBABYITALIA_ACCESS_TOKEN : BBABY_ACCESS_TOKEN
            const accessSecret = user.role === 0 ? oauth_access_token_secret : savedPost.community === 'Italy' ? ANON_ACCESS_TOKEN_SECRET : savedPost.community === 'calciomercato' ? BBABYITALIA_ACCESS_TOKEN_SECRET : BBABY_ACCESS_TOKEN_SECRET
            if (!oauth_access_token) throw new Error('You need to access to your twitter account first')
            const twitterClient = new TwitterApi({
                appKey: TWITTER_CONSUMER_KEY,
                appSecret: TWITTER_CONSUMER_SECRET,
                accessToken,
                accessSecret
            });
            const stats = fs.statSync(media);
            const size = stats.size / (1024*1024)
            const mediaId = await twitterClient.v1.uploadMedia(media);
            return mediaId;
        } catch (err) {
            catchError(err);
        }
    },
    tweet: async(
        user: IUser,
        savedPost: Document<unknown, any, PostProps> & PostProps & {
        _id: Types.ObjectId;},
        language: 'it' | 'en',
        mediaId?: string,
        ) => {
        try {
            const twitter = user?.tokens?.find((provider) => provider.provider === 'twitter');
            if (!twitter) throw new Error("You need to authorize the twitter API into the User Settings page.");
            const {oauth_access_token, oauth_access_token_secret} = twitter
            const accessToken = user.role === 0
            ? oauth_access_token : savedPost.community === 'Italy' 
            ? ANON_ACCESS_TOKEN : language === 'it' 
            ? BBABYITALIA_ACCESS_TOKEN : BBABY_ACCESS_TOKEN
            const accessSecret = user.role === 0
            ? oauth_access_token_secret : savedPost.community === 'Italy'
            ? ANON_ACCESS_TOKEN_SECRET : language === 'it'
            ? BBABYITALIA_ACCESS_TOKEN_SECRET : BBABY_ACCESS_TOKEN_SECRET
            if (!oauth_access_token) throw new Error('You need to access to your twitter account first')
            const twitterClient = new TwitterApi({
                appKey: TWITTER_CONSUMER_KEY,
                appSecret: TWITTER_CONSUMER_SECRET,
                accessToken,
                accessSecret
            });
            const postUrl = `bbabystyle.com/b/${savedPost.community}/comments/${savedPost._id}`;
            const text = savedPost.title;
            let response = undefined
            const finalText = user.role === 1  ? `${text} ${postUrl}` : `${postUrl}`
            if (finalText.length > 300) throw new Error(`Twitter maximum accept maximum 300 words. Please consider making this tweet shorter!`)
            if (mediaId) {
                response = await twitterClient.v1.tweet(finalText, {media_ids: mediaId});
            } else {
                response = await twitterClient.v1.tweet(finalText);
            }
            if (!response) throw new Error("Something went wrong during the upload on twitter");
            return 'ok';
        } catch (err) {
            catchError(err)
        }
    }
}

export default twitterapis;