import { Request } from 'express';
import { Document, Types } from 'mongoose';
import { IUser } from '../models/types/user';

interface UserRequest extends Request {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  user: Document<unknown, any, IUser> &
    IUser & {
      _id: Types.ObjectId;
    };
}
