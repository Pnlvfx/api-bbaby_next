import type {Response, NextFunction, Request} from 'express';
import type { UserRequest } from '../@types/express';

const governance = async (expressRequest:Request,res:Response,next:NextFunction) => {
    try {
        const req = expressRequest as UserRequest;
        const {user} = req;
        if (user.role !== 1) return res.status(401).json({msg: "You need to be an authority to access this API"})
        next()
    } catch (err) {
        if (err instanceof Error)
        res.status(500).json({msg: err.message})
    }
}

export default governance;