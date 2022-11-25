import { getIronSession } from 'iron-session/edge';
import { NextResponse } from 'next/server';

import type { NextRequest } from 'next/server';

import {
  sessionOptions,
  hasSessionExpired,
  isValidSession,
} from '@/libs/session';

const ALLOW_URL_WITHOUT_SESSION = [
  new RegExp('/api/auth/twitter'),
  new RegExp('/api/auth/me'),
  new RegExp('/login'),
  new RegExp('/form/.*/apply'),
];

const getPathname = (requestUrl: string): string => {
  let path = requestUrl.replace(process.env.NEXT_PUBLIC_BASE_URL as string, '');
  if (path.includes('?')) {
    path = path.substring(0, path.indexOf('?'));
  }
  return path;
};

const isAllowWithoutSession = (path: string): boolean => {
  return ALLOW_URL_WITHOUT_SESSION.some((url) => url.test(path));
};

const middleware = async (req: NextRequest) => {
  if (process.env.NODE_ENV !== 'production') {
    console.log('~~~~~~~~~~~ start middleware ~~~~~~~~~~~');
    console.log(req.url);
  }
  const res = NextResponse.next();
  const session = await getIronSession(req, res, sessionOptions);
  const pathname = getPathname(req.url);
  if (
    !isAllowWithoutSession(pathname) &&
    (!isValidSession(session) || hasSessionExpired(session))
  ) {
    if (process.env.NODE_ENV !== 'production') {
      console.log(session);
      console.log('redirect login from: ', pathname);
    }
    await session.destroy();
    return NextResponse.redirect(new URL('/', req.url));
  }
  if (process.env.NODE_ENV !== 'production') {
    console.log('~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~');
  }
};

export const config = {
  matcher: ['/((?!_next|static|favicon.ico).+)'],
};

export { middleware };
