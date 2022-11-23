import type { TwitterUser } from '@/libs/twitter';
import type { IronSession, IronSessionOptions } from 'iron-session';

export const sessionOptions: IronSessionOptions = {
  password: process.env.SESSION_PASSWORD as string,
  cookieName: 'tw-referral/session',
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
    path: '/',
  },
};

export const isValidSession = (session: IronSession): boolean => {
  const { user, twitter, loggedIn } = session;
  if (
    typeof user === 'undefined' ||
    typeof twitter === 'undefined' ||
    !loggedIn
  ) {
    console.log(session);
    return false;
  }
  return true;
};

export const hasSessionExpired = (session: IronSession): boolean => {
  const now = new Date();
  if (!isValidSession(session)) return true;
  if (session.twitter.expiresAt < now) {
    console.log('now   :' + now);
    console.log('now   :' + session.twitter.expiresAt);
    return true;
  }
  return false;
};

// This is where we specify the typings of req.session.*
declare module 'iron-session' {
  interface IronSessionData {
    loggedIn: boolean;
    returnUrl?: string;
    user: {
      userId: string;
    };
    twitter: {
      token: string;
      expiresAt: Date;
      refreshToken: string;
      profile: TwitterUser;
    };
  }
}
