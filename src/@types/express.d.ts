import { Request } from 'express';
import { Document, Types } from 'mongoose';
import { IUser, TokensProps } from '../models/types/user';

interface UserRequest extends Request {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  user: Document<unknown, any, IUser> &
    IUser & {
      _id: Types.ObjectId;
    };
}

interface TwitterRequest extends UserRequest {
  twitter: TokensProps;
}
