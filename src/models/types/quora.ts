import { Document } from 'mongoose';
export interface QuoraProps extends Document {
  permalink: string;
  ups: number;
  url: string;
  title: string;
  description: string;
}
