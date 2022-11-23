import { withIronSessionApiRoute } from 'iron-session/next';

import type { NextApiRequest, NextApiResponse } from 'next';

import {
  AppError,
  cotohaApi,
  firestoreApi,
  twitterApi,
  withApiErrorHandler,
} from '@/libs';
import {
  hasSessionExpired,
  isValidSession,
  sessionOptions,
} from '@/libs/session';

const REDIRECT_URL = `${process.env.NEXT_PUBLIC_BASE_URL}/login`;

const authMe = withApiErrorHandler<{
  profile_image_url: string;
}>(async (req, res) => {
  try {
    const token = await twitterApi.getAccessToken(req, false);

    // ユーザーが存在しない場合は作成しよう
    const userDoc = await firestoreApi.findUserByTwitterId(token.profile.id);
    let userId: string = '';
    if (typeof userDoc === 'undefined') {
      const tweets = await twitterApi.findTweets(token.token, token.profile.id);
      let min = null;
      let max = null;
      if (typeof tweets !== 'undefined' && tweets.length > 0) {
        ({ min, max } = await cotohaApi.getAgeEstimate(
          tweets.map((tweet) => tweet.text)
        ));
      }
      userId = await firestoreApi.createUser({
        twitter_id: token.profile.id,
        data: {
          twitter: {
            id: token.profile.id,
            name: token.profile.name,
            username: token.profile.username,
            profile_image_url: token.profile.profile_image_url,
          },
          ai_guessed_age_gt: min,
          ai_guessed_age_ls: max,
          language: 'jp',
        },
      });
    } else {
      userId = userDoc.doc_id;
    }
    req.session.user = { userId };
    req.session.loggedIn = true;
    await req.session.save();
    res
      .status(200)
      .send({ profile_image_url: token.profile.profile_image_url });
  } catch (err) {
    const _e = err as AppError;
    if (_e.status && _e.statusText) {
      res.status(_e.status).send({ errorMessage: _e.statusText });
    } else {
      res.status(500).send({ errorMessage: 'something happen.' });
    }
  }
});

const getTwitterOAuth2Link = withApiErrorHandler<{ authUrl: string }>(
  async (req, res) => {
    const { returnUrl } = req.query as { returnUrl?: string };

    // tokenを持っている場合は直接マイページへ
    if (isValidSession(req.session) && !hasSessionExpired(req.session)) {
      res.status(200).send({ authUrl: returnUrl ?? '/mypage' });
      return;
    }

    const authUrl = twitterApi.generateAuthLinkV2({
      redirectUrl: `${REDIRECT_URL}`,
    });
    if (typeof returnUrl !== 'undefined') {
      req.session.returnUrl = returnUrl;
      await req.session.save();
    }
    res.status(200).send({ authUrl });
  }
);

const deleteSession = withApiErrorHandler<{ message: string }>(
  async (req, res) => {
    await req.session.destroy();
    res.status(200).send({ errorMessage: 'successed!' });
  }
);

export default withIronSessionApiRoute(function (
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method } = req;
  if (method === 'GET') {
    getTwitterOAuth2Link(req, res);
  } else if (method === 'POST') {
    authMe(req, res);
  } else if (method === 'DELETE') {
    deleteSession(req, res);
  } else {
    res.status(404).send({ message: 'endpoint not found.' });
  }
},
sessionOptions);
