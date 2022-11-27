import { Timestamp } from 'firebase-admin/firestore';

import { db } from './';

import type {
  UserDoc,
  AppSettingsDoc,
  TwitterUserInfo,
  ListFormDoc,
  JudgeHistoryDoc,
  ListFormApplierDoc,
  JudgeHistory,
} from './types';
import type {
  PartialWithFieldValue,
  DocumentSnapshot,
  SetOptions,
  DocumentData,
  QuerySnapshot,
  DocumentReference,
  FieldPath,
  WhereFilterOp,
} from 'firebase-admin/firestore';

import { LIST_FORM_STATUS, APPLY_STATUS, ApplyStatus } from '@/constants';

const _getDocs = async <D>(path: string): Promise<Array<D>> => {
  const snap = (await db.collection(path).get()) as QuerySnapshot<D>;
  return snap.docs.map((d) => d.data());
};

const _getDocsByQuery = async <D>(
  path: string,
  wheres: [string, WhereFilterOp, any]
): Promise<Array<D>> => {
  let result: Array<D> = [];
  const [field, op, values] = wheres;
  if (op === 'in' || op === 'not-in') {
    const _values = [...values];
    await Promise.all(
      Array(Math.ceil(_values.length / 10)).map(async () => {
        const _vs = _values.splice(0, 10);
        const snap = (await db
          .collection(path)
          .where(field, op, _vs)
          .get()) as QuerySnapshot<D>;
        result = [...result, ...snap.docs.map((d) => d.data())];
      })
    );
  } else {
    const snap = (await db
      .collection(path)
      .where(field, op, values)
      .get()) as QuerySnapshot<D>;
    return snap.docs.map((d) => d.data());
  }

  return result;
};

const _getDoc = async <D>(path: string): Promise<D | undefined> => {
  const docSnap = (await db.doc(path).get()) as DocumentSnapshot<D>;
  if (docSnap.exists) {
    return docSnap.data();
  }
};

const _getDocByQuery = async <D>(
  path: string,
  wheres: [string | FieldPath, WhereFilterOp, any]
): Promise<D | undefined> => {
  const [field, op, values] = wheres;
  const snap = (await db
    .collectionGroup(path)
    .where(field, op, values)
    .limit(1)
    .get()) as QuerySnapshot<D>;
  for (const doc of snap.docs) {
    return doc.data();
  }
};

const _setDoc = async <D>(
  path: string,
  value: PartialWithFieldValue<D>,
  options?: SetOptions
): Promise<void> => {
  if (typeof options !== 'undefined') {
    await db
      .doc(path)
      .set(value as PartialWithFieldValue<DocumentData>, options);
  } else {
    await db.doc(path).set(value as PartialWithFieldValue<DocumentData>);
  }
};

export const updateAppSetting = async (update: {
  cotoha: {
    access_token: string;
    expires_at: Timestamp;
  };
}): Promise<void> => {
  await _setDoc(
    `app_settings/${process.env.APP_SETTING_DOC_ID as string}`,
    update,
    {
      merge: true,
    }
  );
};

export const getAppSetting = async (): Promise<AppSettingsDoc | undefined> => {
  return await _getDoc<AppSettingsDoc>(
    `app_settings/${process.env.APP_SETTING_DOC_ID as string}`
  );
};

export const createUser = async (newUser: {
  twitter_id: string;
  doc_id?: string;
  data: {
    twitter: TwitterUserInfo;
    ai_guessed_age_gt: number | null;
    ai_guessed_age_ls: number | null;
    can_create_form: boolean;
  };
}): Promise<UserDoc> => {
  const now = new Date();
  const isNew = typeof newUser.doc_id === 'undefined';
  if (isNew) {
    newUser.doc_id = db.collection('users').doc().id;
  }
  const user = {
    ...newUser,
    data: {
      ...newUser.data,
      updated_at: Timestamp.fromDate(now),
      ...(isNew ? { created_at: Timestamp.fromDate(now) } : {}),
    },
  };
  await db.doc(`users/${newUser.doc_id}`).set(user, { merge: true });

  return user as UserDoc;
};

export const findUserById = async (
  userId: string
): Promise<UserDoc | undefined> => {
  return await _getDoc(`users/${userId}`);
};

export const findUserByIds = async (
  userIds: Array<string>
): Promise<Array<UserDoc> | undefined> => {
  return await _getDocsByQuery('users', ['doc_id', 'in', userIds]);
};

export const findUserByTwitterId = async (
  twitterId: string
): Promise<UserDoc | undefined> => {
  return await _getDocByQuery<UserDoc>('users', [
    'twitter_id',
    '==',
    twitterId,
  ]);
};

export const findUserByTwitterIds = async (
  twitterIds: Array<string>
): Promise<Array<UserDoc>> => {
  return await _getDocsByQuery<UserDoc>('users', [
    'twitter_id',
    'in',
    twitterIds,
  ]);
};

export const createListForm = async (
  user: {
    id: string;
    twitter: TwitterUserInfo;
  },
  list: {
    id: string;
    name: string;
  },
  listMembers: Array<TwitterUserInfo>
): Promise<string> => {
  const newListFormId = await db.runTransaction(async (transaction) => {
    let existsList = await findFormByTwitterListId(list.id);

    const now = new Date();
    const newData = {
      doc_id:
        typeof existsList === 'undefined'
          ? db.collection(`users/${user.id}/list_forms`).doc().id
          : existsList.doc_id,
      twitter_list_id: list.id,
      data: {
        user: {
          doc_id: user.id,
          twitter: user.twitter,
        },
        twitter: {
          list_id: list.id,
          list_name: list.name,
        },
        status: LIST_FORM_STATUS.OPEN,
        updated_at: Timestamp.fromDate(now),
        created_at:
          typeof existsList === 'undefined'
            ? Timestamp.fromDate(now)
            : existsList.data.created_at,
      },
    };

    // フォームの作成
    await transaction.set(
      db.doc(`users/${user.id}/list_forms/${newData.doc_id}`),
      newData
    );

    // メンバーの追加
    if (listMembers.length > 0) {
      const existsMembers = await findUserByTwitterIds(
        listMembers.map((l) => l.id)
      );
      await Promise.all(
        listMembers.map(async (member) => {
          /**
           * ユーザが存在していない場合：作成する
           * ユーザが存在している場合：ヒストリーがない場合は許可回数をカウントアップする
           * 上記以外は何も変化なし（更新は走るけど）
           */
          const memberExists = existsMembers.find(
            (m) => m.twitter_id === member.id
          );
          const isMemberExists = typeof memberExists !== 'undefined';
          let memberUserId = '';

          const allowedHistoryExists =
            await findUserAllowedHistoryByJudgedUserId(member.id, user.id);
          const isAllowedHistoryExists =
            typeof allowedHistoryExists !== 'undefined';

          if (
            (isMemberExists && !isAllowedHistoryExists) ||
            (!isMemberExists && !isAllowedHistoryExists)
          ) {
            const now = new Date();
            const docData = {
              doc_id: memberExists?.doc_id ?? db.collection('users').doc().id,
              twitter_id: member.id,
              data: {
                twitter: member,
                // リスト追加済み＝成人のためAIによる年齢判定はスキップ
                can_create_form: false,
                ai_guessed_age_gt: memberExists?.data.ai_guessed_age_gt ?? 19,
                ai_guessed_age_ls: memberExists?.data.ai_guessed_age_ls ?? null,
                created_at:
                  memberExists?.data.created_at ?? Timestamp.fromDate(now),
                updated_at: Timestamp.fromDate(now),
              },
            };
            transaction.set(db.doc(`users/${docData.doc_id}`), docData);
            memberUserId = docData.doc_id;
          } else {
            memberUserId = (memberExists as UserDoc).doc_id;
          }

          /**
           * 許可履歴を作る。存在していても更新しておく。
           */
          const newJudgeHistoryRef = db.doc(
            `users/${memberUserId}/allowed_by/${user.id}`
          ) as DocumentReference<JudgeHistoryDoc>;
          const now = new Date();
          await transaction.set(
            newJudgeHistoryRef,
            {
              doc_id: newJudgeHistoryRef.id,
              data: {
                twitter: user.twitter,
                judged_at: Timestamp.fromDate(now),
              },
            },
            { merge: true }
          );
        })
      );
    }

    return newData.doc_id;
  });
  return newListFormId;
};

export const findListFormById = async (
  userId: string | null,
  listFormId: string
): Promise<ListFormDoc | undefined> => {
  if (userId !== null) {
    return await _getDoc(`users/${userId}/list_forms/${listFormId}`);
  } else {
    return await _getDocByQuery(`list_forms`, ['doc_id', '==', listFormId]);
  }
};

export const findFormsByUserId = async (
  userId: string
): Promise<Array<ListFormDoc>> => {
  return await _getDocs(`users/${userId}/list_forms`);
};

export const createListFormApplier = async (
  user: {
    id: string;
    twitter: TwitterUserInfo;
  },
  listFormId: string
): Promise<ListFormDoc> => {
  // リストを見つける
  const userData = await findUserById(user.id);
  const list = await findListFormById(null, listFormId);

  if (typeof list === 'undefined') {
    throw new Error('list does not exists');
  } else if (typeof userData === 'undefined') {
    throw new Error('user does not exists');
  }

  await _setDoc<ListFormApplierDoc>(
    `users/${list.data.user.doc_id}/list_forms/${listFormId}/list_form_appliers/${user.id}`,
    {
      doc_id: user.id,
      user_doc_id: user.id,
      data: {
        user: {
          doc_id: user.id,
          twitter: user.twitter,
          can_create_form: false,
          ai_guessed_age_gt: userData.data.ai_guessed_age_gt,
          ai_guessed_age_ls: userData.data.ai_guessed_age_ls,
        },
        owner: {
          user_doc_id: list.data.user.doc_id,
          list_doc_id: list.doc_id,
          twitter: list.data.user.twitter,
        },
        status: APPLY_STATUS.STAY,
        created_at: Timestamp.now(),
        updated_at: Timestamp.now(),
      },
    }
  );

  return list;
};

export const findAppliedFromByUserId = async (
  userId: string
): Promise<Array<ListFormApplierDoc>> => {
  const snap = (await db
    .collectionGroup('list_form_appliers')
    .where('user_doc_id', '==', userId)
    .get()) as QuerySnapshot<ListFormApplierDoc>;
  return snap.docs.map((d) => d.data());
};

export const updateApplyStatus = async (
  user: {
    id: string;
    twitter: TwitterUserInfo;
  },
  formId: string,
  applierId: string,
  status: ApplyStatus
) => {
  await db.runTransaction(async (transaction) => {
    // update applys status
    const applier = _getDoc(
      `users/${user.id}/list_forms/${formId}/list_form_appliers/${applierId}`
    );
    if (!applier) {
      throw new Error('this applier does not exists!');
    }

    await transaction.set<ListFormApplierDoc>(
      db.doc(
        `users/${user.id}/list_forms/${formId}/list_form_appliers/${applierId}`
      ) as DocumentReference<ListFormApplierDoc>,
      {
        data: {
          status: status,
        },
      },
      { merge: true }
    );

    // create history
    /**
     * 許可履歴を作る。存在していても更新しておく。
     */
    const newRef = db.doc(
      `users/${applierId}/${
        status === APPLY_STATUS.ALLOW ? 'allowed_by' : 'denied_by'
      }/${user.id}`
    ) as DocumentReference<JudgeHistoryDoc>;
    await transaction.set<JudgeHistoryDoc>(
      newRef,
      {
        doc_id: newRef.id,
        data: {
          twitter: user.twitter,
          judged_at: Timestamp.fromDate(new Date()),
        },
      },
      { merge: true }
    );
  });
};

export const findAppliersByFormId = async (
  userId: string,
  formId: string
): Promise<Array<ListFormApplierDoc>> => {
  return await _getDocs<ListFormApplierDoc>(
    `users/${userId}/list_forms/${formId}/list_form_appliers`
  );
};

export const findApplierByApplierId = async (
  userId: string,
  formId: string,
  applierId: string
): Promise<ListFormApplierDoc | undefined> => {
  return await _getDoc<ListFormApplierDoc>(
    `users/${userId}/list_forms/${formId}/list_form_appliers/${applierId}`
  );
};

export const findFormByTwitterListId = async (
  twitterListId: string
): Promise<ListFormDoc | undefined> => {
  return await _getDocByQuery<ListFormDoc>(`list_forms`, [
    'twitter_list_id',
    '==',
    twitterListId,
  ]);
};

export const findFormsByApplierId = async (
  applierId: string
): Promise<Array<ListFormApplierDoc> | undefined> => {
  return await _getDocsByQuery<ListFormApplierDoc>('list_form_appliers', [
    'doc_id',
    '==',
    applierId,
  ]);
};

export const findUserAllowedHistoryByJudgedUserId = async (
  userId: string,
  allowedByUserId: string
): Promise<JudgeHistory | undefined> => {
  const data = await _getDoc<JudgeHistoryDoc>(
    `users/${userId}/allowed_by/${allowedByUserId}`
  );
  return data
    ? {
        ...data,
        data: {
          ...data.data,
          judged_at: data.data.judged_at.toDate(),
        },
      }
    : undefined;
};

export const findUserDeniedHistoryByJudgedUserId = async (
  userId: string,
  deniedByUserId: string
): Promise<JudgeHistory | undefined> => {
  const data = await _getDoc<JudgeHistoryDoc>(
    `users/${userId}/denied_by/${deniedByUserId}`
  );
  return data
    ? {
        ...data,
        data: {
          ...data.data,
          judged_at: data.data.judged_at.toDate(),
        },
      }
    : undefined;
};

export const findUserAllowedHistoryByUserId = async (
  userId: string
): Promise<Array<JudgeHistory>> => {
  const data = await _getDocs<JudgeHistoryDoc>(`users/${userId}/allowed_by`);
  return data.map((d) => ({
    ...d,
    data: {
      ...d.data,
      judged_at: d.data.judged_at.toDate(),
    },
  }));
};

export const findUserDeniedHistoryByUserId = async (
  userId: string
): Promise<Array<JudgeHistory>> => {
  const data = await _getDocs<JudgeHistoryDoc>(`users/${userId}/denied_by`);
  return data.map((d) => ({
    ...d,
    data: {
      ...d.data,
      judged_at: d.data.judged_at.toDate(),
    },
  }));
};

export const deleteUserAllowedHistoryByUserId = async (
  userId: string,
  judgedByID: string
) => {
  return await db.doc(`user/${userId}/allowed_by/${judgedByID}`).delete();
};

export const deleteUserDeniedHistoryByUserId = async (
  userId: string,
  judgedByID: string
) => {
  return await db.doc(`user/${userId}/denied_by/${judgedByID}`).delete();
};
