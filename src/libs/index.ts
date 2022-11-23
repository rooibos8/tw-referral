import { NextApiRequest, NextApiResponse } from 'next';

import * as cotohaApi from './cotoha';
import * as firestoreApi from './firebase/firestore';
import * as twitterApi from './twitter';

export type FetchParams =
  | string
  | string[][]
  | Record<string, string>
  | URLSearchParams
  | undefined;

export interface AppError {
  status?: number;
  statusText?: string;
  data?: any;
}

export interface AppApiErrorResponse {
  errorMessage: string;
}

export const withApiErrorHandler = <T>(
  handler: (
    req: NextApiRequest,
    res: NextApiResponse<T | AppApiErrorResponse>
  ) => Promise<void>
) => {
  return async (
    req: NextApiRequest,
    res: NextApiResponse<T | AppApiErrorResponse>
  ) => {
    try {
      await handler(req, res);
    } catch (err) {
      const _e = err as AppError;
      console.log('api has an error');
      console.log(_e);
      if (_e.status === 401) {
        req.session.destroy();
        res.redirect(401, '/');
      } else if (_e.status === 429) {
        res.redirect(429, '/429');
      }
      if (_e.status && _e.statusText) {
        if (_e.status === 404) {
          res.status(404).send({ errorMessage: _e.statusText });
        } else {
          res.status(500).send({ errorMessage: _e.statusText });
        }
      } else {
        res.status(500).send({ errorMessage: 'something happen.' });
      }
    }
  };
};

export { cotohaApi, firestoreApi, twitterApi };
