import express from 'express';
const auth = (req:express.Request,res:express.Response,next:express.NextFunction) => {
    try {
        const {token} = req.cookies;
        if (!token) return res.status(400).json({msg: "Invalid authorizathion."});
        next();
    } catch (err) {
        if (err instanceof Error)
        res.status(500).json({msg: err.message})
    }
}

export default auth;
