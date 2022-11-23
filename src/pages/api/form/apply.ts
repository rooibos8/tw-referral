import { withIronSessionApiRoute } from 'iron-session/next';

import type { TwitterUserInfo } from '@/libs/firebase';
import type { NextApiRequest, NextApiResponse } from 'next';

import { ApplyStatus, APPLY_STATUS } from '@/constants';
import { firestoreApi, twitterApi, withApiErrorHandler } from '@/libs';
import { sessionOptions } from '@/libs/session';

const applyForm = withApiErrorHandler<TwitterUserInfo>(async (req, res) => {
  const {
    listId,
  }: {
    listId?: string;
  } = JSON.parse(req.body);
  const user = req.session.user;
  const twitter = await twitterApi.getAccessToken(req);

  if (typeof listId === 'undefined' || typeof user === 'undefined') {
    res.status(400).send({ errorMessage: 'BAD REQUEST' });
    return;
  }

  const list = await firestoreApi.createListFormApplier(
    { id: user.userId, twitter: twitter.profile },
    listId
  );

  res.status(201).send(list.data.user.twitter);
});

const updateApply = withApiErrorHandler<{ ok: boolean }>(async (req, res) => {
  const {
    listId,
    applierId,
    status,
  }: {
    listId?: string;
    applierId: string;
    status: ApplyStatus;
  } = JSON.parse(req.body);
  const user = req.session.user;
  const twitter = await twitterApi.getAccessToken(req);

  if (
    typeof listId === 'undefined' ||
    typeof user === 'undefined' ||
    (status !== APPLY_STATUS.ALLOW &&
      status !== APPLY_STATUS.DENY &&
      status !== APPLY_STATUS.STAY)
  ) {
    throw { status: 400, statusText: 'BAD REQUEST' };
  }

  const list = await firestoreApi.findListFormById(user.userId, listId);
  if (typeof list === 'undefined') {
    throw { status: 400, statusText: 'BAD REQUEST' };
  }

  const applier = await firestoreApi.findApplierByApplierId(
    user.userId,
    listId,
    applierId
  );
  if (typeof applier === 'undefined') {
    throw { status: 404, statusText: 'APPLIER NOT FOUND' };
  }

  await firestoreApi.updateApplyStatus(
    { id: user.userId, twitter: twitter.profile },
    listId,
    applierId,
    status
  );

  // twitterのリスト更新
  if (status === APPLY_STATUS.ALLOW) {
    const l = await twitterApi.findListById(
      twitter.token,
      list.twitter_list_id //'1335245385116205056'
    );
    const isSuccess = await twitterApi.addListMember(
      twitter.token,
      list.twitter_list_id,
      applier?.data.user.twitter.id as string
    );
    if (!isSuccess) {
      // 失敗した場合は切り戻し
      await firestoreApi.updateApplyStatus(
        { id: user.userId, twitter: twitter.profile },
        listId,
        applierId,
        applier?.data.status as ApplyStatus
      );
      throw { status: 400, statusText: 'something wrong.' };
    }
  }

  res.status(200).send({ ok: true });
});

export default withIronSessionApiRoute(function (
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const { method } = req;
    if (method === 'POST') {
      applyForm(req, res);
    } else if (method === 'PUT') {
      updateApply(req, res);
    } else {
      res.status(404).send({ message: 'endpoint not found.' });
    }
  } catch (err) {
    res.status(500).send('something happen.');
  }
},
sessionOptions);
