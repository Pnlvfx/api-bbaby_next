import type { Response } from "express";

export const catchError = (err : unknown, res: Response) => {
    if (err instanceof Error) {
        res.status(500).json(err.message);
    } else {
        res.status(500).json("API error");
    }
}