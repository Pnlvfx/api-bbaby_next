import { Request, Response } from 'express';
import { catchErrorCtrl } from '../../coraline/cor-route/crlerror';
import Quora from '../../models/Quora';

const quoraCtrl = {
  getQuoras: async (req: Request, res: Response) => {
    try {
      const { limit, skip } = req.query;
      const _limit = Number(limit);
      const _skip = Number(skip);
      const quoras = await Quora.find({}).sort({ ups: -1 }).limit(_limit).skip(_skip);
      res.status(200).json(quoras);
    } catch (err) {
      catchErrorCtrl(err, res);
    }
  },
};

export default quoraCtrl;
