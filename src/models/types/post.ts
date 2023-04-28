import { Document } from 'mongoose';
import { CommunityProps } from './community';

export interface PostProps extends Document {
  author: string;
  title: string;
  body?: string;
  community: string;
  communityIcon: string;
  community_detail?: CommunityProps;
  mediaInfo: MediaInfoProps;
  ups: number;
  liked: null | boolean;
  numComments: number;
  permalink: string;
}

interface MediaInfoProps {
  dimension: [number, number];
  isImage?: boolean;
  isVideo?: boolean;
  image?: string;
  video?: {
    url?: string;
  };
}
