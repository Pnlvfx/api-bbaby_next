import {Request} from 'express';
import { IUser } from './user';

interface UserRequest extends Request {
    user: IUser
}