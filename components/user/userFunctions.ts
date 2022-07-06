import jwt from 'jsonwebtoken'
import config from '../../config/config'
import User from '../../models/User';

const secret = config.SECRET

export const getUserFromToken = async(token:string) => {
    const user:any = jwt.verify(token, secret);
    return User.findById(user.id)
}