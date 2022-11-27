import { Timestamp } from 'firebase/firestore/lite';
import { atom } from 'recoil';

import type { UserDoc } from '@/libs/firebase';

export type SessionState = {
  loggedIn: boolean;
  user: UserDoc;
  twitter: {
    profile: {
      name: string;
      username: string;
      profileImageUrl: string;
    };
  };
};

const SESSION_DEFAULT_STATE: SessionState = {
  loggedIn: false,
  user: {
    doc_id: '',
    twitter_id: '',
    data: {
      ai_guessed_age_gt: null,
      ai_guessed_age_ls: null,
      can_create_form: false,
      twitter: {
        id: '',
        name: '',
        username: '',
        profile_image_url: '',
      },
      created_at: Timestamp.now(),
      updated_at: Timestamp.now(),
    },
  },
  twitter: {
    profile: {
      name: '',
      username: '',
      profileImageUrl: '',
    },
  },
} as const;

const sessionState = atom<SessionState>({
  key: 'session',
  default: SESSION_DEFAULT_STATE,
});

export { sessionState };
