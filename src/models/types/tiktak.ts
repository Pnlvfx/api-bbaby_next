import { Document } from 'mongoose';

export interface TiktakProps extends Document {
  original_title: string;
  title: string;
  original_body: string;
  body: string;
  permalink: string;
  audio?: string;
  duration?: number;
  background_video?: string;
  video?: string;
  synthetize?: string;
}
