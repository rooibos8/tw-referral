import { withIronSessionSsr } from 'iron-session/next';
import { InferGetServerSidePropsType } from 'next';
import React, { useEffect } from 'react';

import { BackButton } from '@/components';
import { PostApplyApiResponse } from '@/constants';
import {
  hasSessionExpired,
  isValidSession,
  sessionOptions,
} from '@/libs/session';

export const getServerSideProps = withIronSessionSsr(async function ({
  req,
  query,
}) {
  const { listId }: { listId?: string } = query;
  if (!isValidSession(req.session) || hasSessionExpired(req.session)) {
    req.session.destroy();
    return { props: { listId: listId as string, needAuth: true } };
  }
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/form/apply`,
    {
      method: 'POST',
      body: JSON.stringify({ listId: listId }),
      headers: {
        cookie: req.headers.cookie as string,
      },
    }
  );
  if (!res.ok) {
    return {
      redirect: {
        destination: '/',
        permanent: false,
      },
    };
  }
  const { name, username, profile_image_url }: PostApplyApiResponse =
    await res.json();

  return {
    props: {
      needAuth: false,
      listId: listId as string,
      name,
      userName: username,
      profileImageUrl: profile_image_url,
    },
  };
},
sessionOptions);

export default function Apply({
  listId,
  name,
  userName,
  profileImageUrl,
  needAuth,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  useEffect(() => {
    if (needAuth) {
      (async () => {
        const res = await fetch(
          `/api/auth/me?returnUrl=${encodeURIComponent(
            `/form/${listId}/apply`
          )}`
        );
        const { authUrl } = await res.json();
        location.href = authUrl;
      })();
    }
  }, []);

  return (
    <div>
      <BackButton href="/mypage">戻る</BackButton>
      {needAuth === true ? (
        <>Twitter認証へ移動します...</>
      ) : (
        <>
          <img src={profileImageUrl as string} alt="profile image" />
          {name} {userName}
          参加を申請しました！
        </>
      )}
    </div>
  );
}
