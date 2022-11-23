import { withIronSessionApiRoute } from 'iron-session/next';

import type { NextApiRequest, NextApiResponse } from 'next';

import { APPLY_STATUS, GetAppliersApiResponse } from '@/constants';

import { firestoreApi, twitterApi, withApiErrorHandler } from '@/libs';
import { sessionOptions } from '@/libs/session';

const getAppliers = withApiErrorHandler<GetAppliersApiResponse>(
  async (req, res) => {
    const {
      id: formId,
    }: {
      id?: string;
    } = req.query;
    const user = req.session.user;
    const twitter = await twitterApi.getAccessToken(req);

    if (typeof formId === 'undefined' || typeof user === 'undefined') {
      throw { status: 400, statusText: 'BAD REQUEST' };
    }

    let appliers = await firestoreApi.findAppliersByFormId(user.userId, formId);
    const form = await firestoreApi.findListFormById(user.userId, formId);
    if (typeof form === 'undefined') {
      throw { status: 400, statusText: 'BAD REQUEST' };
    }

    const stayApplier = appliers.filter(
      (a) => a.data.status === APPLY_STATUS.STAY
    );
    if (stayApplier.length > 0) {
      // リストに含まれていたらAllow扱い＆ヒストリー作成
      const existsListMembers = await twitterApi.findListMembers(
        twitter.token,
        form.twitter_list_id,
        stayApplier.map((a) => a.data.user.twitter.id)
      );

      await Promise.all([
        // リストにすでに存在する人はALLOWに更新
        existsListMembers.map(async (existsListMember) => {
          const applier = appliers.find(
            (a) => a.data.user.twitter.id === existsListMember.id
          );
          if (typeof applier === 'undefined') return;
          await Promise.all([
            await firestoreApi.updateApplyStatus(
              { id: user.userId, twitter: twitter.profile },
              formId,
              applier.user_doc_id,
              APPLY_STATUS.ALLOW
            ),
          ]);
          applier.data.status = APPLY_STATUS.ALLOW;
        }),
        // Twitterリストに存在しない＆ヒストリーが存在する場合は、ヒストリーを削除
        stayApplier
          .filter(
            (a) =>
              !existsListMembers.some((l) => l.id !== a.data.user.twitter.id)
          )
          .map(async (applier) => {
            const history =
              await firestoreApi.findUserAllowedHistoryByJudgedUserId(
                applier.user_doc_id,
                user.userId
              );
            if (typeof history === 'undefined') return;
            await firestoreApi.deleteUserAllowedHistoryByUserId(
              applier.user_doc_id,
              user.userId
            );
          }),
      ]);
    }

    res.status(200).send({
      data: appliers.map((a) => ({
        user: a.data.user,
        status: a.data.status,
      })),
    });
  }
);

export default withIronSessionApiRoute(function (
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method } = req;
  if (method === 'GET') {
    getAppliers(req, res);
  } else {
    res.status(404).send({ message: 'endpoint not found.' });
  }
},
sessionOptions);
