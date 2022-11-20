import {
  collection,
  getDocs,
  // addDoc,
  query,
  where,
  startAt,
  setDoc,
  doc,
  getDoc,
} from 'firebase/firestore/lite';

import { db } from './';

import type { UserDoc, AppSettingsDoc } from './types';
import type {
  CollectionReference,
  DocumentReference,
} from 'firebase/firestore/lite';

const updateAppSetting = async (update: AppSettingsDoc): Promise<void> => {
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
    console.error('Error adding document: ', e);
    throw 'updating settings has failed';
  }
};

const getAppSetting = async (): Promise<AppSettingsDoc | undefined> => {
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

const createUser = async (newUser: UserDoc): Promise<void> => {
  try {
    await setDoc<UserDoc>(
      doc(db, 'users', newUser.tw_id) as DocumentReference<UserDoc>,
      newUser
    );
  } catch (e) {
    console.error('Error adding document: ', e);
    throw 'creating a new user has failed';
  }
};

const findUserByTwitterId = async (
  twitterId: string
): Promise<UserDoc | undefined> => {
  try {
    const docRef = doc(db, 'users', twitterId) as DocumentReference<UserDoc>;
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return docSnap.data();
    } else {
      return;
    }
  } catch (e) {
    console.error('Error finding document: ', e);
    throw 'finding specific user by twitter name has failed';
  }
};

export { createUser, findUserByTwitterId, updateAppSetting, getAppSetting };
