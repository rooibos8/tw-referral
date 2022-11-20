import type { TwitterLists, TwitterUser } from '@/libs/twitter';
import type { IronSessionOptions } from 'iron-session';

export const sessionOptions: IronSessionOptions = {
  password: process.env.SESSION_PASSWORD as string,
  cookieName: 'tw-referral/session',
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
  },
};

// This is where we specify the typings of req.session.*
declare module 'iron-session' {
  interface IronSessionData {
    token: string;
    expiresAt: Date;
    user?: TwitterUser & {
      lists: TwitterLists;
    };
  }
}
