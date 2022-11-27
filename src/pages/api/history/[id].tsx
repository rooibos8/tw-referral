import { withIronSessionApiRoute } from 'iron-session/next';

import type { GetJudgeHistoryApiResponse } from '@/constants';
import type { NextApiRequest, NextApiResponse } from 'next';

import { firestoreApi, withApiErrorHandler } from '@/libs';

import { JudgeHistory, JudgeHistoryDoc } from '@/libs/firebase';
import { sessionOptions } from '@/libs/session';

const getHistory = withApiErrorHandler<GetJudgeHistoryApiResponse>(
  async (req, res) => {
    const user = req.session.user;
    const { id } = req.query;

    if (typeof user === 'undefined' || typeof id !== 'string') {
      throw { status: 400, statusText: 'BAD REQUEST' };
    }

    const history: {
      allowed: Array<JudgeHistory>;
      denied: Array<JudgeHistory>;
    } = { allowed: [], denied: [] };
    await Promise.all([
      firestoreApi
        .findUserAllowedHistoryByUserId(id)
        .then((res) => (history.allowed = res)),
      firestoreApi
        .findUserDeniedHistoryByUserId(id)
        .then((res) => (history.denied = res)),
    ]);

    res.status(200).send({ data: history });
  }
);

export default withIronSessionApiRoute(function (
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method } = req;
  if (method === 'GET') {
    getHistory(req, res);
  } else {
    res.status(404).send({ message: 'endpoint not found.' });
  }
},
sessionOptions);
