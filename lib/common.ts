import type { Response } from "express";

export const catchError = (err : unknown, res?: Response) => {
    console.log('catchError')
    if (err instanceof Error) {
        console.log(err)
        res ? res.status(500).json({msg: err.message}) : new Error(err.message);
    } else {
        res ? res.status(500).json({msg: 'API error'}) : new Error('API error');
    }
}