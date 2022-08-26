import type { Response } from "express";
import telegramapis from "./telegramapis";

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
            res.status(500).json({msg: err.message});
        })
    } else {
        telegramapis.sendLog(`API error`).then(() => {
            res.status(500).json({msg: 'API error'});
        })
    }
}