import {
  collection,
  getDocs,
  query,
  where,
  setDoc,
  doc,
  getDoc,
  runTransaction,
  Timestamp,
  serverTimestamp,
  limit,
  collectionGroup,
  deleteDoc,
  WhereFilterOp,
  FieldPath,
} from 'firebase/firestore/lite';

import { db } from './';

import type {
  UserDoc,
  AppSettingsDoc,
  TwitterUserInfo,
  ListFormDoc,
  JudgeHistoryDoc,
  ListFormApplierDoc,
} from './types';
import type {
  CollectionReference,
  DocumentReference,
  Query,
} from 'firebase/firestore/lite';

import { LIST_FORM_STATUS, APPLY_STATUS, ApplyStatus } from '@/constants';

const _getDocs = async <D>(col: CollectionReference<D>): Promise<Array<D>> => {
  try {
    const docSnap = await getDocs<D>(col);
    return docSnap.docs.map((d) => d.data());
  } catch (e) {
    console.error('Error finding list by id: ', e);
    throw 'finding specific user by twitter name has failed';
  }
};

const _getDocsByQuery = async <Q, D>(
  col: CollectionReference,
  wheres: [string, WhereFilterOp, Array<Q> | Q]
): Promise<Array<D>> => {
  try {
    let result: Array<D> = [];
    const [field, op, values] = wheres;
    if (op === 'in' || op === 'not-in') {
      const _values: Array<Q> = [...(values as Array<Q>)];
      await Promise.all(
        Array(Math.ceil(_values.length / 10)).map(async () => {
          const _vs = _values.splice(0, 10);
          const q = query<D>(
            col as CollectionReference<D>,
            where(field, op, _vs)
          );
          const snap = await getDocs(q);
          result = [...result, ...snap.docs.map((d) => d.data())];
        })
      );
    } else {
      const q = query<D>(
        col as CollectionReference<D>,
        where(field, op, values)
      );
      const snap = await getDocs(q);
      return snap.docs.map((d) => d.data());
    }

    return result;
  } catch (e) {
    console.error('Error finding user: ', e);
    throw 'finding specific user by twitter name has failed';
  }
};

const _getDoc = async <D>(
  doc: DocumentReference<D>
): Promise<D | undefined> => {
  try {
    const docSnap = await getDoc<D>(doc);
    if (docSnap.exists()) {
      return docSnap.data();
    }
  } catch (e) {
    console.error('Error finding UserJudgedHistory by judged user id: ', e);
    throw 'finding specific user by twitter name has failed';
  }
};

const _getDocByQuery = async <Q, D>(
  col: CollectionReference,
  wheres: [string | FieldPath, WhereFilterOp, Q]
): Promise<D | undefined> => {
  try {
    const [field, op, values] = wheres;
    const q = query<D>(
      col as CollectionReference<D>,
      where(field, op, values),
      limit(1)
    );
    const snap = await getDocs(q);
    for (const doc of snap.docs) {
      return doc.data();
    }
  } catch (e) {
    console.error('Error finding list by id: ', e);
    throw 'finding specific user by twitter name has failed';
  }
};

export const updateAppSetting = async (update: {
  cotoha: {
    access_token: string;
    expires_at: Timestamp;
  };
}): Promise<void> => {
  try {
    await setDoc<AppSettingsDoc>(
      doc(
        db,
        'app_settings',
        process.env.APP_SETTING_DOC_ID as string
      ) as DocumentReference<AppSettingsDoc>,
      update,
      {
        merge: true,
      }
    );
  } catch (e) {
    console.error('Error updating app settings: ', e);
    throw 'updating settings has failed';
  }
};

export const getAppSetting = async (): Promise<AppSettingsDoc | undefined> => {
  try {
    const docRef = doc(
      db,
      'app_settings',
      process.env.APP_SETTING_DOC_ID as string
    ) as DocumentReference<AppSettingsDoc>;
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return docSnap.data();
    } else {
      return;
    }
  } catch (e) {
    console.error('Error finding app settings: ', e);
    throw 'finding the app settings has failed';
  }
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
  try {
    let ref: DocumentReference<UserDoc>;
    if (typeof newUser.doc_id === 'undefined') {
      ref = doc<UserDoc>(
        collection(db, 'users') as CollectionReference<UserDoc>
      );
    } else {
      ref = doc(db, 'users', newUser.doc_id) as DocumentReference<UserDoc>;
    }

    const user = {
      ...newUser,
      doc_id: typeof newUser.doc_id !== 'undefined' ? newUser.doc_id : ref.id,
      data: {
        ...newUser.data,
        created_at: Timestamp.now(),
        updated_at: Timestamp.now(),
      },
    };
    await setDoc<UserDoc>(ref, user);
    return user;
  } catch (e) {
    console.error('Error adding user: ', e);
    throw 'creating a new user has failed';
  }
};

export const findUserById = async (
  userId: string
): Promise<UserDoc | undefined> => {
  try {
    const docSnap = await getDoc<UserDoc>(
      doc(db, 'users', userId) as DocumentReference<UserDoc>
    );
    if (docSnap.exists()) {
      return docSnap.data();
    }
  } catch (e) {
    console.error('Error finding list by id: ', e);
    throw 'finding specific user by twitter name has failed';
  }
};

export const findUserByIds = async (
  userIds: Array<string>
): Promise<Array<UserDoc> | undefined> => {
  try {
    return await _getDocsByQuery<string, UserDoc>(collection(db, 'users'), [
      'doc_id',
      'in',
      userIds,
    ]);
  } catch (e) {
    console.error('Error finding list by id: ', e);
    throw 'finding specific user by twitter name has failed';
  }
};

export const findUserByTwitterId = async (
  twitterId: string
): Promise<UserDoc | undefined> => {
  try {
    const q = query<UserDoc>(
      collection(db, 'users') as CollectionReference<UserDoc>,
      where('twitter_id', '==', twitterId),
      limit(1)
    );
    const docsSnap = await getDocs(q);
    for (const doc of docsSnap.docs) {
      return doc.data();
    }
  } catch (e) {
    console.error('Error finding user: ', e);
    throw 'finding specific user by twitter name has failed';
  }
};

export const findUserByTwitterIds = async (
  twitterIds: Array<string>
): Promise<Array<UserDoc>> => {
  return await _getDocsByQuery<string, UserDoc>(collection(db, 'users'), [
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
  const newListFormId = await runTransaction(db, async (transaction) => {
    // フォームの作成
    const existsList = await findFormByTwitterListId(user.id, list.id);
    const newListFormDocRef =
      typeof existsList === 'undefined'
        ? doc<ListFormDoc>(
            collection(
              db,
              'users',
              user.id,
              'list_forms'
            ) as CollectionReference<ListFormDoc>
          )
        : doc<ListFormDoc>(
            collection(
              db,
              'users',
              user.id,
              'list_forms'
            ) as CollectionReference<ListFormDoc>,
            existsList.doc_id
          );
    await transaction.set(newListFormDocRef, {
      doc_id: newListFormDocRef.id,
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
        updated_at: serverTimestamp(),
        created_at: existsList?.data.created_at ?? serverTimestamp(),
      },
    });

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
            const userRef = (
              !isMemberExists
                ? doc(collection(db, 'users'))
                : doc(db, 'users', (memberExists as UserDoc).doc_id)
            ) as DocumentReference<UserDoc>;
            transaction.set(userRef, {
              doc_id: memberExists?.doc_id ?? userRef.id,
              twitter_id: member.id,
              data: {
                twitter: member,
                // リスト追加済み＝成人のためAIによる年齢判定はスキップ
                can_create_form: false,
                ai_guessed_age_gt: memberExists?.data.ai_guessed_age_gt ?? 19,
                ai_guessed_age_ls: memberExists?.data.ai_guessed_age_ls ?? null,
                created_at: memberExists?.data.created_at ?? serverTimestamp(),
                updated_at: serverTimestamp(),
              },
            });
            memberUserId = userRef.id;
          } else {
            memberUserId = (memberExists as UserDoc).doc_id;
          }

          /**
           * 許可履歴を作る。存在していても更新しておく。
           */
          const newJudgeHistoryRef = doc(
            db,
            'users',
            memberUserId,
            'allowed_by',
            user.id
          ) as DocumentReference<JudgeHistoryDoc>;
          await transaction.set(
            newJudgeHistoryRef,
            {
              doc_id: newJudgeHistoryRef.id,
              data: {
                twitter: user.twitter,
                judged_at: serverTimestamp(),
              },
            },
            { merge: true }
          );
        })
      );
    }

    return newListFormDocRef.id;
  });
  return newListFormId;
};

export const findListFormById = async (
  userId: string | null,
  listFormId: string
): Promise<ListFormDoc | undefined> => {
  if (userId !== null) {
    return await _getDoc<ListFormDoc>(
      doc(
        db,
        'users',
        userId,
        'list_forms',
        listFormId
      ) as DocumentReference<ListFormDoc>
    );
  } else {
    return await _getDocByQuery<string, ListFormDoc>(
      collectionGroup(db, 'list_forms') as CollectionReference<ListFormDoc>,
      ['doc_id', '==', listFormId]
    );
  }
};

export const findFormsByUserId = async (
  userId: string
): Promise<Array<ListFormDoc>> => {
  try {
    const docSnap = await getDocs<ListFormDoc>(
      collection(
        db,
        'users',
        userId,
        'list_forms'
      ) as CollectionReference<ListFormDoc>
    );
    return docSnap.docs.map((d) => d.data());
  } catch (e) {
    console.error('Error finding list by id: ', e);
    throw 'finding specific user by twitter name has failed';
  }
};

export const createListFormApplier = async (
  user: {
    id: string;
    twitter: TwitterUserInfo;
    aiGuessedAgeGt?: number;
    aiGuessedAgeLs?: number;
  },
  listFormId: string
): Promise<ListFormDoc> => {
  // リストを見つける
  const userData = await findUserById(user.id);
  const list = await findListFormById(null, listFormId);

  if (typeof list === 'undefined') {
    throw 'list does not exists';
  } else if (typeof userData === 'undefined') {
    throw 'user does not exists';
  }

  const newApplierDocRef = doc(
    db,
    'users',
    list.data.user.doc_id,
    'list_forms',
    listFormId,
    'list_form_appliers',
    user.id
  ) as DocumentReference<ListFormApplierDoc>;
  await setDoc(newApplierDocRef, {
    doc_id: newApplierDocRef.id,
    user_doc_id: newApplierDocRef.id,
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
  });

  return list;
};

export const findAppliedFromByUserId = async (
  userId: string
): Promise<Array<ListFormApplierDoc>> => {
  const q = query<ListFormApplierDoc>(
    collectionGroup(db, 'list_form_appliers') as Query<ListFormApplierDoc>,
    where('user_doc_id', '==', userId)
  );
  const docsSnap = await getDocs(q);
  return docsSnap.docs.map((d) => d.data());
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
  await runTransaction(db, async (transaction) => {
    // update applys status
    const applierRef = doc(
      db,
      'users',
      user.id,
      'list_forms',
      formId,
      'list_form_appliers',
      applierId
    ) as DocumentReference<ListFormApplierDoc>;
    const applierSnap = await getDoc(applierRef);
    if (!applierSnap.exists()) {
      throw 'this applier does not exists!';
    }
    await transaction.set(
      applierRef,
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
    const newJudgeHistoryRef = doc(
      db,
      'users',
      applierId,
      status === APPLY_STATUS.ALLOW ? 'allowed_by' : 'denied_by',
      user.id
    ) as DocumentReference<JudgeHistoryDoc>;
    await transaction.set(
      newJudgeHistoryRef,
      {
        doc_id: newJudgeHistoryRef.id,
        data: {
          twitter: user.twitter,
          judged_at: serverTimestamp(),
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
    collection(
      db,
      'users',
      userId,
      'list_forms',
      formId,
      'list_form_appliers'
    ) as CollectionReference<ListFormApplierDoc>
  );
};

export const findApplierByApplierId = async (
  userId: string,
  formId: string,
  applierId: string
): Promise<ListFormApplierDoc | undefined> => {
  return await _getDoc<ListFormApplierDoc>(
    doc(
      db,
      'users',
      userId,
      'list_forms',
      formId,
      'list_form_appliers',
      applierId
    ) as DocumentReference<ListFormApplierDoc>
  );
};

export const findFormByTwitterListId = async (
  userId: string,
  twitterListId: string
): Promise<ListFormDoc | undefined> => {
  try {
    const q = query<ListFormDoc>(
      collection(
        db,
        'users',
        userId,
        'list_forms'
      ) as CollectionReference<ListFormDoc>,
      where('twitter_list_id', '==', twitterListId),
      limit(1)
    );
    const docsSnap = await getDocs(q);
    for (const doc of docsSnap.docs) {
      return doc.data();
    }
  } catch (e) {
    console.error('Error finding form by twitter list id: ', e);
    throw 'finding specific user by twitter name has failed';
  }
};

export const findFormsByApplierId = async (
  applierId: string
): Promise<Array<ListFormApplierDoc> | undefined> => {
  const lists = await _getDocsByQuery<string, ListFormApplierDoc>(
    collectionGroup(
      db,
      'list_form_appliers'
    ) as CollectionReference<ListFormApplierDoc>,
    ['doc_id', '==', applierId]
  );
  return lists;
};

export const findUserAllowedHistoryByJudgedUserId = async (
  userId: string,
  allowedByUserId: string
): Promise<JudgeHistoryDoc | undefined> => {
  try {
    const docSnap = await getDoc<JudgeHistoryDoc>(
      doc(
        db,
        'users',
        userId,
        'allowed_by',
        allowedByUserId
      ) as DocumentReference<JudgeHistoryDoc>
    );
    if (docSnap.exists()) {
      return docSnap.data();
    }
  } catch (e) {
    console.error('Error finding UserJudgedHistory by judged user id: ', e);
    throw 'finding specific user by twitter name has failed';
  }
};

export const findUserDeniedHistoryByJudgedUserId = async (
  userId: string,
  deniedByUserId: string
): Promise<JudgeHistoryDoc | undefined> => {
  try {
    const docSnap = await getDoc<JudgeHistoryDoc>(
      doc(
        db,
        'users',
        userId,
        'denied_by',
        deniedByUserId
      ) as DocumentReference<JudgeHistoryDoc>
    );
    if (docSnap.exists()) {
      return docSnap.data();
    }
  } catch (e) {
    console.error('Error finding UserJudgedHistory by judged user id: ', e);
    throw 'finding specific user by twitter name has failed';
  }
};

export const findUserAllowedHistoryByUserId = async (
  userId: string
): Promise<Array<JudgeHistoryDoc>> => {
  try {
    const docsSnap = await getDocs<JudgeHistoryDoc>(
      collection(
        db,
        'users',
        userId,
        'allowed_by'
      ) as CollectionReference<JudgeHistoryDoc>
    );
    return docsSnap.docs.map((d) => d.data());
  } catch (e) {
    console.error('Error finding UserJudgedHistory by judged user id: ', e);
    throw 'finding specific user by twitter name has failed';
  }
};

export const findUserDeniedHistoryByUserId = async (
  userId: string
): Promise<Array<JudgeHistoryDoc>> => {
  try {
    const docsSnap = await getDocs<JudgeHistoryDoc>(
      collection(
        db,
        'users',
        userId,
        'denied_by'
      ) as CollectionReference<JudgeHistoryDoc>
    );
    return docsSnap.docs.map((d) => d.data());
  } catch (e) {
    console.error('Error finding UserJudgedHistory by judged user id: ', e);
    throw 'finding specific user by twitter name has failed';
  }
};

export const deleteUserAllowedHistoryByUserId = async (
  userId: string,
  judgedByID: string
) => {
  try {
    await deleteDoc(
      doc(db, 'user_judge_history', userId, 'allowed_by', judgedByID)
    );
  } catch (e) {
    console.error('Error finding UserJudgedHistory by judged user id: ', e);
    throw 'finding specific user by twitter name has failed';
  }
};

export const deleteUserDeniedHistoryByUserId = async (
  userId: string,
  judgedByID: string
) => {
  try {
    await deleteDoc(
      doc(db, 'user_judge_history', userId, 'denied_by', judgedByID)
    );
  } catch (e) {
    console.error('Error finding UserJudgedHistory by judged user id: ', e);
    throw 'finding specific user by twitter name has failed';
  }
};
