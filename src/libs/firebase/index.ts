import * as firebase from 'firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';

const app = !firebase.apps.length
  ? firebase.initializeApp({
      credential: firebase.credential.cert(
        JSON.parse(process.env.FIREBASE_CREDENTIAL as string)
      ),
    })
  : firebase.app();

const db = getFirestore(app);

export { app, db };
export * from './firestore';
export * from './types';
