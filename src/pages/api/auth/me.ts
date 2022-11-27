import { withIronSessionApiRoute } from 'iron-session/next';

import type { NextApiRequest, NextApiResponse } from 'next';

import {
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
  const token = await twitterApi.getAccessToken(req, false);

  // ユーザーが存在しない場合は作成しよう
  const settings = await firestoreApi.getAppSetting();
  let userDoc = await firestoreApi.findUserByTwitterId(token.profile.id);

  let min = userDoc?.data.ai_guessed_age_gt;
  let max = userDoc?.data.ai_guessed_age_ls;
  if (typeof userDoc === 'undefined') {
    const tweets = await twitterApi.findTweets(token.token, token.profile.id);
    if (typeof tweets !== 'undefined' && tweets.length > 0) {
      ({ min, max } = await cotohaApi.getAgeEstimate(
        tweets.map((tweet) => tweet.text)
      ));
    }
  }

  userDoc = await firestoreApi.createUser({
    twitter_id: token.profile.id,
    doc_id: userDoc?.doc_id,
    data: {
      twitter: {
        id: token.profile.id,
        name: token.profile.name,
        username: token.profile.username,
        profile_image_url: token.profile.profile_image_url,
      },
      ai_guessed_age_gt: min ?? null,
      ai_guessed_age_ls: max ?? null,
      can_create_form:
        settings?.creators.some((id) => id === token.profile.username) ?? false,
    },
  });

  req.session.user = userDoc;
  req.session.loggedIn = true;
  await req.session.save();

  res.status(200).send({ profile_image_url: token.profile.profile_image_url });
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
