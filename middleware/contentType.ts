import type {Response, NextFunction, Request} from 'express';

const contentType = async (req: Request,res:Response,next:NextFunction) => {
    try {
        if (req.method === 'post') {
            if (!req.is('application/json')) {
                return res.status(400).json({msg: "You need to add Content Type as JSON in this API."})
            }
        }
        next()
    } catch (err) {
        if (err instanceof Error)
        res.status(500).json({msg: err.message})
    }
}

export default contentType;