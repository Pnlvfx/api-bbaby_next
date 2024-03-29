import { Schema, model } from 'mongoose';
import { IUser } from './types/user';

const UserSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      unique: true,
      required: [true, 'Please enter your email!'],
      trim: true,
    },
    username: {
      type: String,
      unique: true,
      required: [true, "can't be blank"],
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: Number,
      default: 0,
    },
    avatar: {
      type: String,
      default: 'https://res.cloudinary.com/bbabystyle/image/upload/v1655209740/default/avatar_txt7me.webp',
    },
    email_verified: {
      type: Boolean,
      default: false,
    },
    country: {
      type: String,
    },
    countryCode: {
      type: String,
    },
    city: {
      type: String,
    },
    region: {
      type: String,
    },
    lat: {
      type: String,
    },
    lon: {
      type: String,
    },
    upVotes: {
      type: [Schema.Types.ObjectId],
    },
    downVotes: {
      type: [Schema.Types.ObjectId],
    },
    tokens: {
      type: [
        {
          access_token: String,
          refresh_token: String,
          provider: String,
          expires: Number,
        },
      ],
    },
    hasExternalAccount: {
      type: Boolean,
      default: false,
    },
    externalAccounts: {
      type: [],
    },
    subscribed: {
      type: [String],
      default: null,
    },
    last_post: {
      type: [Schema.Types.ObjectId],
    },
    is_bot: {
      type: Boolean,
    },
  },
  {
    timestamps: true,
  },
);
const User = model('User', UserSchema);

export default User;
