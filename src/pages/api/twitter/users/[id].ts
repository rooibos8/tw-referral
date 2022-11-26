import { profile } from 'console';

import { withIronSessionApiRoute } from 'iron-session/next';

import type { GetTwitterProfileApiResponse } from '@/constants';
import type { NextApiRequest, NextApiResponse } from 'next';

import { firestoreApi, twitterApi, withApiErrorHandler } from '@/libs';

import { UserDoc } from '@/libs/firebase';
import { sessionOptions } from '@/libs/session';
import { Tweet, TwitterProfile } from '@/libs/twitter';

const getTwitterProfile = withApiErrorHandler<GetTwitterProfileApiResponse>(
  async (req, res) => {
    const user = req.session.user;
    const twitter = await twitterApi.getAccessToken(req);

    const { id } = req.query;

    if (
      typeof twitter === 'undefined' ||
      typeof user === 'undefined' ||
      typeof id !== 'string'
    ) {
      throw { status: 400, statusText: 'BAD REQUEST' };
    }

    const applier = await firestoreApi.findUserById(id);
    if (typeof applier === 'undefined') {
      throw { status: 400, statusText: 'BAD REQUEST' };
    }

    let resData: UserDoc & {
      tweets?: Array<Tweet>;
      twitter?: TwitterProfile;
    } = applier;
    const profile = await twitterApi.findUser(
      twitter.token,
      applier.twitter_id
    );
    resData.twitter = profile;
    res.status(200).send(resData);
  }
);

export default withIronSessionApiRoute(function (
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method } = req;
  if (method === 'GET') {
    getTwitterProfile(req, res);
  } else {
    res.status(404).send({ message: 'endpoint not found.' });
  }
},
sessionOptions);
