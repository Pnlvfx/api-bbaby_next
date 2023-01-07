import type { Response } from "express";
import telegramapis from "./telegramapis/telegramapis";
import rateLimit from 'express-rate-limit';

export const catchError = (err : unknown) => {
    if (err instanceof Error) {
        throw new Error(`${err.message}`);
    } else if (typeof err === 'string') {
        throw new Error(err);
    } else {
        throw new Error(`API error`);
    }
}


export const catchErrorCtrl = (err: unknown, res: Response, from: string) => {
    if (err instanceof Error) {
        telegramapis.sendLog(err.message + ' ' + from).then(() => {
            res.status(500).json({msg: err.message});
        })
    } else if (typeof err === 'string') {
        telegramapis.sendLog(err + ' ' + from).then(() => {
            res.status(500).json({msg: err});
        })
    } else {
        telegramapis.sendLog('API ERROR' + ' ' + from).then(() => {
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