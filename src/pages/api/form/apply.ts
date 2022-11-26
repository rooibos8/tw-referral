import { withIronSessionApiRoute } from 'iron-session/next';

import type { TwitterUserInfo } from '@/libs/firebase';
import type { NextApiRequest, NextApiResponse } from 'next';

import {
  ApplyStatus,
  APPLY_STATUS,
  GetApplyApiResponse,
  LIST_FORM_STATUS,
  UpdateApplyApiResponse,
} from '@/constants';
import { firestoreApi, twitterApi, withApiErrorHandler } from '@/libs';
import {
  hasSessionExpired,
  isValidSession,
  sessionOptions,
} from '@/libs/session';

const getApply = withApiErrorHandler<GetApplyApiResponse>(async (req, res) => {
  const user = req.session.user;

  if (!isValidSession(req.session) || hasSessionExpired(req.session)) {
    throw { status: 401, statusText: 'BAD REQUEST' };
  }

  const lists = await firestoreApi.findFormsByApplierId(user.doc_id);
  res.status(200).send({ data: lists ?? [] });
});

const applyForm = withApiErrorHandler<TwitterUserInfo | {}>(
  async (req, res) => {
    const {
      listId,
    }: {
      listId?: string;
    } = JSON.parse(req.body);
    const user = req.session.user;
    const twitter = await twitterApi.getAccessToken(req);

    if (
      !isValidSession(req.session) ||
      hasSessionExpired(req.session) ||
      typeof listId === 'undefined'
    ) {
      throw { status: 401, statusText: 'BAD REQUEST' };
    }

    const list = await firestoreApi.findListFormById(null, listId);
    if (typeof list === 'undefined') {
      throw { status: 404, statusText: 'list does not exist' };
    }
    if (list.data.status !== LIST_FORM_STATUS.OPEN) {
      res.status(406).send({});
      return;
    } else if (user.doc_id === list.data.user.doc_id) {
      await req.session.destroy();
      res.status(202).send({ ok: false, text: 'does not request to own list' });
    }

    await firestoreApi.createListFormApplier(
      { id: user.doc_id, twitter: twitter.profile },
      listId
    );

    res.status(201).send(list.data.user.twitter);
  }
);

const updateApply = withApiErrorHandler<UpdateApplyApiResponse>(
  async (req, res) => {
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

    const list = await firestoreApi.findListFormById(user.doc_id, listId);
    if (typeof list === 'undefined') {
      throw { status: 400, statusText: 'BAD REQUEST' };
    }
    if (list.data.status !== LIST_FORM_STATUS.OPEN) {
      res.status(406).send({
        ok: false,
        text: 'this list is not available now',
      });
      return;
    }

    const applier = await firestoreApi.findApplierByApplierId(
      user.doc_id,
      listId,
      applierId
    );
    if (typeof applier === 'undefined') {
      throw { status: 404, statusText: 'APPLIER NOT FOUND' };
    }

    await firestoreApi.updateApplyStatus(
      { id: user.doc_id, twitter: twitter.profile },
      listId,
      applierId,
      status
    );

    // twitterのリスト更新
    if (status === APPLY_STATUS.ALLOW) {
      const isSuccess = await twitterApi.addListMember(
        twitter.token,
        list.twitter_list_id,
        applier?.data.user.twitter.id as string
      );
      if (!isSuccess) {
        // 失敗した場合は切り戻し
        await firestoreApi.updateApplyStatus(
          { id: user.doc_id, twitter: twitter.profile },
          listId,
          applierId,
          applier?.data.status as ApplyStatus
        );
        throw { status: 400, statusText: 'something wrong.' };
      }
    }

    res.status(200).send({ ok: true });
  }
);

export default withIronSessionApiRoute(function (
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const { method } = req;
    if (method === 'GET') {
      getApply(req, res);
    } else if (method === 'POST') {
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
