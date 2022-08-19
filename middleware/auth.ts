import type {Response, NextFunction, Request} from 'express';
import type { UserRequest } from '../@types/express';
import { getUserFromToken } from '../components/user/user-functions/userFunctions';

const auth = async (expressRequest:Request,res:Response,next:NextFunction) => {
    try {
        const req = expressRequest as UserRequest
        const {token} = req.cookies;
        if (!token) return res.status(400).json({msg: "Invalid authorizathion."});
        const user = await getUserFromToken(req.cookies.token);
        if (!user) return res.status(401).json({msg: "Your token is no more valid, please try to logout and login again."})
        req.user = user
        next();
    } catch (err) {
        if (err instanceof Error)
        res.status(500).json({msg: err.message})
    }
}

export default auth;
