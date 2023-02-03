import { Document } from 'mongoose';

export interface CommunityProps extends Document {
  name: string;
  image: string;
  cover: string;
  author: string;
  description: string;
  acceptFollowers: boolean;
  subscribers: number;
  user_is_moderator: boolean;
  user_is_banned: boolean;
  user_is_contributor: boolean;
  user_is_subscriber: boolean;
  number_of_posts: number;
  language: 'it' | 'en';
  region: string;
  category?: string;
  sub_categories?: string[];
}
