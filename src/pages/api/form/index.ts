import { withIronSessionApiRoute } from 'iron-session/next';

import type { TwitterListMembers } from '@/libs/twitter';
import type { NextApiRequest, NextApiResponse } from 'next';

import { Form, APPLY_STATUS } from '@/constants';

import { firestoreApi, twitterApi, withApiErrorHandler } from '@/libs';
import { createListForm } from '@/libs/firebase';

import {
  sessionOptions,
  isValidSession,
  hasSessionExpired,
} from '@/libs/session';

const createForm = withApiErrorHandler<{ newId: string }>(async (req, res) => {
  const {
    twListId,
    importExistsAccount,
  }: {
    twListId?: string;
    importExistsAccount?: boolean;
  } = JSON.parse(req.body);

  if (!isValidSession(req.session) || hasSessionExpired(req.session)) {
    throw { status: 401, statusText: "Session invalid'" };
  } else if (!req.session.user.data.can_create_form) {
    throw { status: 401, statusText: 'Unauthrization this modification' };
  } else if (typeof twListId === 'undefined') {
    throw { status: 400, statusText: "BAD REQUEST'" };
  }

  const user = req.session.user;
  const twitter = await twitterApi.getAccessToken(req);
  const { token } = twitter;

  const list = await twitterApi.findListById(token, twListId);
  if (typeof list === 'undefined') {
    throw { status: 404, statusText: 'list not found' };
  }

  let members: TwitterListMembers = [];
  if (importExistsAccount) {
    members = await twitterApi.findListMembers(token, twListId, []);
  }
  const newId = await createListForm(
    { id: user.doc_id, twitter: twitter.profile },
    list,
    members
  );
  res.status(201).send({ newId });
});

const getForms = withApiErrorHandler<{ data: Array<Form> }>(
  async (req, res) => {
    const token = await twitterApi.getAccessToken(req);
    const user = req.session.user;

    const lists = await twitterApi.findOwnedList(token.token, token.profile.id);
    if (typeof lists === 'undefined') {
      res.status(200).send({ data: [] });
      return;
    }

    const forms = await firestoreApi.findFormsByUserId(user.doc_id);
    const output: Array<Form> = [];
    await Promise.all(
      lists.map(async (list) => {
        const form = forms.find((f) => f.twitter_list_id === list.id);
        if (typeof form === 'undefined') {
          output.push({
            name: list.name,
            twitter: list,
            appliers: [],
          });
          return;
        }
        const appliers = await firestoreApi.findAppliersByFormId(
          user.doc_id,
          form.doc_id
        );
        output.push({
          id: form.doc_id,
          name: list.name,
          status: form.data.status,
          twitter: list,
          appliers: appliers
            .filter((a) => a.data.status === APPLY_STATUS.STAY)
            .map((a) => a.data.user),
        });
      })
    );

    res.status(200).send({ data: output });
  }
);

export default withIronSessionApiRoute(function (
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { method } = req;
  if (method === 'POST') {
    createForm(req, res);
  } else if (method === 'GET') {
    getForms(req, res);
  } else {
    res.status(404).send({ message: 'endpoint not found.' });
  }
},
sessionOptions);
