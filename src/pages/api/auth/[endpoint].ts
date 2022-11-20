import { withIronSessionApiRoute } from 'iron-session/next';

import type { TwitterLists } from '@/libs/twitter';
import type { NextApiRequest, NextApiResponse } from 'next';

import * as cotoha from '@/libs/cotoha';
import { createUser, findUserByTwitterId } from '@/libs/firebase';

import { sessionOptions } from '@/libs/session';

import {
  generateAuthLinkV2,
  getAccessToken,
  findMe,
  findTweets,
  findOwnedList,
} from '@/libs/twitter';

type CreateSessionWithTwitter = {
  profile_image_url: string;
  lists: TwitterLists;
};
type GetTokenApiResponse = { authUrl: string };

const createSessionWithTwitter = async (
  req: NextApiRequest,
  res: NextApiResponse<CreateSessionWithTwitter | string>
) => {
  try {
    const { code, state } = req.query as { code: string; state: string };
    let token = req.session.token;
    let expiresAt = req.session.expiresAt;

    if (typeof token === 'undefined') {
      ({ access_token: token, expires_at: expiresAt } = await getAccessToken({
        code,
        state,
      }));
    } else if (
      typeof token !== 'undefined' &&
      typeof expiresAt !== 'undefined' &&
      new Date() > expiresAt
    ) {
      ({ access_token: token, expires_at: expiresAt } = await getAccessToken({
        token,
      }));
    }
    const me = await findMe(token);
    const lists = await findOwnedList(token, me.id);

    // ユーザーが存在しない場合は作成しよう
    const userDoc = await findUserByTwitterId(me.id);
    if (typeof userDoc === 'undefined') {
      const tweets = await findTweets(token, me.id);
      const { min, max } = await cotoha.getAgeEstimate(tweets);
      await createUser({
        tw_id: me.id,
        tw_name: me.name,
        tw_username: me.username,
        tw_profile_image_url: me.profile_image_url,
        allowed: 0,
        denied: 0,
        ai_guessed_age_gt: min,
        ai_guessed_age_ls: max,
        language: 'jp',
      });
    }
    req.session.token = token;
    req.session.user = { ...me, lists };
    await req.session.save();
    res.status(200).send({ profile_image_url: me.profile_image_url, lists });
  } catch (error) {
    console.log(error);
    res.status(500).send('something happen.');
  }
};

const getTwitterOAuth2Link = async (
  req: NextApiRequest,
  res: NextApiResponse<GetTokenApiResponse>
) => {
  // tokenを持っている場合は直接マイページへ
  const token = req.session.token;
  if (typeof token !== 'undefined') {
    res.status(200).send({ authUrl: '/mypage?code=code&state=state' });
    return;
  }

  const authUrl = generateAuthLinkV2({
    redirectUrl: `${process.env.PUBLIC_BASE_URL}/mypage`,
    scopes: [
      'users.read',
      'list.read',
      'list.write',
      'tweet.read',
      'offline.access',
    ],
  });
  res.status(200).send({ authUrl });
};

function handler(req: NextApiRequest, res: NextApiResponse) {
  const { endpoint } = req.query;
  if (endpoint === 'twitter') {
    getTwitterOAuth2Link(req, res);
  } else if (endpoint === 'me') {
    createSessionWithTwitter(req, res);
  } else {
    res.status(404).send({ message: 'endpoint not found.' });
  }
}

export default withIronSessionApiRoute(handler, sessionOptions);
