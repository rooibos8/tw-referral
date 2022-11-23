import { atom } from 'recoil';

export type SessionState = {
  loggedIn: boolean;
  user: {
    userId: string;
  };
  twitter: {
    profile: {
      name: string;
      username: string;
      profileImageUrl: string;
    };
  };
};

const SESSION_DEFAULT_STATE = {
  loggedIn: false,
  user: {
    userId: '',
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
