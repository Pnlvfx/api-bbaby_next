import { Schema, model } from 'mongoose';
import { QuoraProps } from './types/quora';

const QuoraSchema = new Schema<QuoraProps>({
  ups: {
    type: Number,
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
  url: {
    type: String,
    required: true,
  },
  permalink: {
    type: String,
    required: true,
  },
});
const Quora = model('Quora', QuoraSchema);

export default Quora;
