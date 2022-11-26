import { withIronSessionSsr } from 'iron-session/next';
import {
  GetServerSideProps,
  GetServerSidePropsContext,
  GetServerSidePropsResult,
} from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

import { sessionOptions } from '@/libs/session';
import { SessionState } from '@/store';

export interface ServerSideData {
  dataForSSR: string;
}

export interface ServerSidePropsParams<T> {
  props: T;
  data: ServerSideData;
  context: Parameters<GetServerSideProps>[0];
}

export const withSessionSsr = <
  P extends {
    [key: string]: unknown;
    session: SessionState;
  } = {
    [key: string]: unknown;
    session: SessionState;
  }
>(
  handler?: (
    context: GetServerSidePropsContext
  ) => GetServerSidePropsResult<P> | Promise<GetServerSidePropsResult<P>>
): ((
  context: GetServerSidePropsContext
) => Promise<GetServerSidePropsResult<P>>) => {
  // @ts-ignore
  return withIronSessionSsr<P>(async (ctx) => {
    try {
      const { loggedIn, user, twitter } = ctx.req.session;
      const session = {
        loggedIn: loggedIn ?? null,
        user: user ?? null,
        twitter: twitter
          ? {
              profile: {
                name: twitter.profile.name ?? null,
                username: twitter.profile.username ?? null,
                profileImageUrl: twitter.profile.profile_image_url ?? null,
              },
            }
          : null,
      };
      if (!session.loggedIn) {
        ctx.req.session.destroy();
      }

      const i18n = await serverSideTranslations(ctx.locale ?? 'jp', ['common']);
      if (handler) {
        const p = await handler(ctx);
        if (p && 'props' in p) {
          return {
            props: {
              ...p.props,
              session,
              ...i18n,
            },
          };
        }
        return {
          ...p,
          props: {
            session,
            ...i18n,
          },
        };
      }

      return {
        props: { session, ...i18n },
      };
    } catch (ex) {
      console.error(ex);
      throw ex;
    }
  }, sessionOptions);
};
