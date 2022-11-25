import cookie from 'cookie';
import { unsealData } from 'iron-session';

import type { TwitterUser } from '@/libs/twitter';
import type { IronSession, IronSessionOptions } from 'iron-session';

import { UserDoc } from '@/libs/firebase';

export const sessionOptions: IronSessionOptions = {
  password: process.env.SESSION_PASSWORD as string,
  cookieName: 'tw-referral/session',
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
    path: '/',
  },
};

export const isValidSession = (session: IronSession): boolean => {
  const { user, twitter } = session;
  if (typeof user === 'undefined' || typeof twitter === 'undefined') {
    return false;
  }
  return true;
};

export const hasSessionExpired = (session: IronSession): boolean => {
  const now = new Date();
  if (!isValidSession(session)) return true;
  if (session.twitter.expiresAt < now) {
    return true;
  }
  return false;
};

// This is where we specify the typings of req.session.*
declare module 'iron-session' {
  interface IronSessionData {
    loggedIn: boolean;
    returnUrl?: string;
    user: UserDoc;
    twitter: {
      token: string;
      expiresAt: Date;
      refreshToken: string;
      profile: TwitterUser;
    };
  }
}
