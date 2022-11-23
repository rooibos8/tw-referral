import { withIronSessionSsr } from 'iron-session/next';
import React from 'react';

import { sessionOptions } from '@/libs/session';

export const getServerSideProps = withIronSessionSsr(async function ({
  req,
  res,
  query,
}) {
  const { code, state } = query ?? {};

  const userRes = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/me?code=${code}&state=${state}`,
    {
      method: 'POST',
      headers: {
        cookie: req.headers.cookie as string,
      },
    }
  );

  const setCookie = userRes.headers.get('set-cookie');
  if (setCookie !== null) {
    res.setHeader('set-cookie', setCookie);
  }

  return {
    redirect: {
      destination: req.session.returnUrl ?? '/mypage',
      permanent: false,
    },
  };
},
sessionOptions);

export default function Login() {
  return <div></div>;
}
