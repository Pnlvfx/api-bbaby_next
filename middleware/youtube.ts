import type {Response, NextFunction, Request} from 'express';

const youtube = async (expressRequest:Request,res:Response,next:NextFunction) => {
    try {
        
    } catch (err) {
        if (err instanceof Error)
        res.status(500).json({msg: err.message})
    }
}

export default youtube;