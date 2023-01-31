import { Schema, model } from 'mongoose';
import { NewsProps } from '../@types/news';

const NewsSchema = new Schema<NewsProps>(
  {
    author: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    permalink: {
      type: String,
      required: true,
      unique: true,
    },
    mediaInfo: {
      type: Object,
    },
  },
  {
    timestamps: true,
  },
);
const News = model('News', NewsSchema);

export default News;
