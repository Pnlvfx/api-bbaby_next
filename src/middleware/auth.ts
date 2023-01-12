import type {Response, NextFunction, Request} from 'express';
import type { UserRequest } from '../@types/express';
import { getUserFromToken } from '../components/user/user-functions/userFunctions';

const auth = async (expressRequest: Request, res: Response, next: NextFunction) => {
    try {
        const req = expressRequest as UserRequest;
        console.log(req.headers.origin)
        const {token} = req.cookies;
        const errorMessage = "This API require user authentication";
        if (!token) {
            res.statusMessage = errorMessage
            return res.status(401).json({msg: errorMessage})
        };
        const user = await getUserFromToken(req.cookies.token);
        if (!user) {
            res.statusMessage = errorMessage
            return res.status(401).json({msg: errorMessage})
        }
        req.user = user;
        next();
    } catch (err) {
        if (err instanceof Error)
        res.status(500).json({msg: err.message})
    }
}

export default auth;
