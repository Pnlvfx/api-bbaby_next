import { Request, Response } from "express";
import { catchErrorCtrl } from "../../lib/common";
import telegramapis from "../../lib/telegramapis/telegramapis";

const analyticsCtrl = {
    sendLog: async (req: Request, res: Response) => {
        try {
            const {message} = req.query;
            if (!message) return res.status(400).json({msg: 'Missing required parameter!'})
            await telegramapis.sendLog(message.toString())
            res.status(200).json('ok');
        } catch (err) {
            catchErrorCtrl(err, res, 'analyticsCtrl.sendLog');
        }
    }
}

export default analyticsCtrl;