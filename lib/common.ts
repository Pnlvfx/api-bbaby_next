import type { Response } from "express";
import telegramapis from "./telegramapis";
import rateLimit from 'express-rate-limit';

export const catchError = (err : unknown, from?: string) => {
    if (err instanceof Error) {
        telegramapis.sendLog(`${err.message} ${from}`).then(() => {
            throw new Error(`${err.message} ${from}`);
        })
    } else {
        telegramapis.sendLog(`API error ${from}`).then(() => {
            throw new Error(`API error ${from}`);
        })
    }
}


export const catchErrorCtrl = (err: unknown, res: Response) => {
    if (err instanceof Error) {
        telegramapis.sendLog(err.message).then(() => {
            return res.status(500).json({msg: err.message});
        })
    } else {
        telegramapis.sendLog(`API error`).then(() => {
            return res.status(500).json({msg: 'API error'});
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