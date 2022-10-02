import type { Response } from "express";
import telegramapis from "./telegramapis";
import rateLimit from 'express-rate-limit';

export const catchError = (err : unknown) => {
    if (err instanceof Error) {
        throw new Error(`${err.message}`);
    } else {
        throw new Error(`API error`);
    }
}


export const catchErrorCtrl = (err: unknown, res: Response) => {
    if (err instanceof Error) {
        telegramapis.sendLog(err.message).then(() => {
            res.status(500).json({msg: err.message});
        })
    } else {
        telegramapis.sendLog(`API error`).then(() => {
            res.status(500).json({msg: 'API error'});
        })
    }
}

export const limiter = rateLimit({
    windowMs: 40, //seconds
    max: 1,
    message: 'Suck useEffect',
    standardHeaders: true,
    legacyHeaders: false
})