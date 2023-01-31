import { Document } from 'mongoose';

interface CategoryProps extends Document {
  _id: number;
  name:
    | 'Sports'
    | 'Gaming'
    | 'News'
    | 'TV'
    | 'Memes'
    | 'Travel'
    | 'Tech'
    | 'Music'
    | 'Art'
    | 'Beauty'
    | 'Books'
    | 'Crypto'
    | 'Fashion'
    | 'Finance'
    | 'Food'
    | 'Health'
    | 'Learning'
    | 'Mindblowing'
    | 'Outdoors'
    | 'Parenting';
}
