import {Request} from 'express';
import { Document, Types } from 'mongoose';
import { IUser } from '../models/types/user';

interface UserRequest extends Request {
    user: Document<unknown, any, IUser> & IUser & {
        _id: Types.ObjectId;
    }
}