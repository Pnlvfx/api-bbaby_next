import { Document } from 'mongoose';
export interface QuoraProps extends Document, ScrapedProps {
  permalink: string;
}
