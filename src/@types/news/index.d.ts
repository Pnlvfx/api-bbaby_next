import { Document } from 'mongoose';

interface mediaInfoProps {
  isImage?: boolean;
  isVideo?: boolean;
  image?: string;
  video?: string;
  width: number;
  height: number;
  alt: string;
}

interface NewsProps extends Document {
  author: string;
  title: string;
  description: string;
  permalink: string;
  mediaInfo: mediaInfoProps;
  sharePostToTG: boolean;
  setSharePostToTG: Dispatch<SetStateAction<boolean>>;
  sharePostToTwitter: boolean;
  setSharePostToTwitter: Dispatch<SetStateAction<boolean>>;
}
