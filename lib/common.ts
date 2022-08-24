import type { Response } from "express";
import config from '../config/config';
import telegramapis from "./telegramapis";

export const catchError = (err : unknown, res?: Response) => {
    const {NODE_ENV} = config;
    if (err instanceof Error) {
        if (NODE_ENV === 'production') telegramapis.sendLog(err.message);
        res ? res.status(500).json({msg: err.message}) : new Error(err.message);
    } else {
        if (NODE_ENV === 'production') telegramapis.sendLog(`API error`);
        res ? res.status(500).json({msg: 'API error'}) : new Error('API error');
    }
}