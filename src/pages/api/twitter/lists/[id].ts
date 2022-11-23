import { withIronSessionApiRoute } from 'iron-session/next';

import type {
  GetTwitterListApiResponse,
  GetTwitterProfileApiResponse,
} from '@/constants';
import type { NextApiRequest, NextApiResponse } from 'next';

import { twitterApi, withApiErrorHandler } from '@/libs';

import { sessionOptions } from '@/libs/session';

const getTwitterList = withApiErrorHandler<GetTwitterListApiResponse>(
  async (req, res) => {
    const user = req.session.user;
    const twitter = await twitterApi.getAccessToken(req);

    const { id } = req.query;

    if (typeof user === 'undefined' || typeof id !== 'string') {
      throw { status: 400, statusText: 'BAD REQUEST' };
    }

    const list = await twitterApi.findListById(twitter.token, id);
    if (typeof list === 'undefined') {
      throw { status: 404, statusText: 'LIST NOT FOUND' };
    }

    res.status(200).send({ ...list });
  }
);

export default withIronSessionApiRoute(function (
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method } = req;
  if (method === 'GET') {
    getTwitterList(req, res);
  } else {
    res.status(404).send({ message: 'endpoint not found.' });
  }
},
sessionOptions);
