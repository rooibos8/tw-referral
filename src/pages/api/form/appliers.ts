import { withIronSessionApiRoute } from 'iron-session/next';

import type { NextApiRequest, NextApiResponse } from 'next';

import { APPLY_STATUS, GetAppliersApiResponse } from '@/constants';

import { firestoreApi, twitterApi, withApiErrorHandler } from '@/libs';
import {
  hasSessionExpired,
  isValidSession,
  sessionOptions,
} from '@/libs/session';

const getAppliers = withApiErrorHandler<GetAppliersApiResponse>(
  async (req, res) => {
    const {
      id: formId,
    }: {
      id?: string;
    } = req.query;
    const user = req.session.user;
    const twitter = await twitterApi.getAccessToken(req);

    if (!isValidSession(req.session) || hasSessionExpired(req.session)) {
      throw { status: 401, statusText: 'BAD REQUEST' };
    }
    if (typeof formId === 'undefined' || typeof user === 'undefined') {
      throw { status: 400, statusText: 'BAD REQUEST' };
    }

    const form = await firestoreApi.findListFormById(user.doc_id, formId);
    if (typeof form === 'undefined') {
      throw { status: 400, statusText: 'BAD REQUEST' };
    }

    const resData: GetAppliersApiResponse = { data: [] };

    const appliers = await firestoreApi.findAppliersByFormId(
      user.doc_id,
      formId
    );
    const stayApplier = appliers.filter(
      (a) => a.data.status === APPLY_STATUS.STAY
    );
    if (stayApplier.length > 0) {
      const existsListMembers = await twitterApi.findListMembers(
        twitter.token,
        form.twitter_list_id,
        stayApplier.map((a) => a.data.user.twitter.id)
      );

      await Promise.all(
        stayApplier.map(async (applier) => {
          const existsApplier = existsListMembers.find(
            (l) => l.id === applier.data.user.twitter.id
          );
          const alreadyAllowed = typeof existsApplier !== 'undefined';
          const data = {
            user: {
              ...applier.data.user,
              allowed: 0,
              denied: 0,
            },
            status: applier.data.status,
          };
          await Promise.all([
            // allowed回数の取得
            alreadyAllowed
              ? null
              : (async () => {
                  const allowed =
                    await firestoreApi.findUserAllowedHistoryByUserId(
                      applier.user_doc_id
                    );
                  data.user.allowed = allowed.length;
                })(),
            // denied回数の取得
            alreadyAllowed
              ? null
              : (async () => {
                  const denied =
                    await firestoreApi.findUserDeniedHistoryByUserId(
                      applier.user_doc_id
                    );
                  data.user.denied = denied.length;
                })(),
            (async () => {
              if (alreadyAllowed) {
                // リストにすでに存在する人はALLOWに更新
                await firestoreApi.updateApplyStatus(
                  { id: user.doc_id, twitter: twitter.profile },
                  formId,
                  applier.user_doc_id,
                  APPLY_STATUS.ALLOW
                );
              } else {
                // Twitterリストに存在しない＆ヒストリーが存在する場合は、ヒストリーを削除
                await firestoreApi.deleteUserAllowedHistoryByUserId(
                  applier.user_doc_id,
                  user.doc_id
                );
              }
            })(),
          ]);
          if (!alreadyAllowed) {
            resData.data.push(data);
          }
        })
      );
    }

    res.status(200).send(resData);
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
