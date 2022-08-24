import type { Response } from "express";
import config from '../config/config';
import telegramapis from "./telegramapis";

export const catchError = (err : unknown) => {
    const {NODE_ENV} = config;
    if (err instanceof Error) {
        if (NODE_ENV === 'production') telegramapis.sendLog(err.message);
        throw new Error(err.message);
    } else {
        if (NODE_ENV === 'production') telegramapis.sendLog(`API error`);
        throw new Error('API error');
    }
}


export const catchErrorCtrl = (err: unknown, res: Response) => {
    const {NODE_ENV} = config;
    if (err instanceof Error) {
        if (NODE_ENV === 'production') telegramapis.sendLog(err.message);
        res.status(500).json({msg: err.message});
    } else {
        if (NODE_ENV === 'production') telegramapis.sendLog(`API error`);
        res.status(500).json({msg: 'API error'});
    }
}