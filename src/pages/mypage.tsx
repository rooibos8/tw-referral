import React, { useEffect, useState } from 'react';
import { useRecoilState } from 'recoil';

import type { TwitterLists } from '@/libs/twitter';
import type { GetServerSidePropsContext } from 'next';

import { auth as globalAuth } from '@/store';

type PageProps = {
  code: string;
  state: string;
};

export async function getServerSideProps(
  context: GetServerSidePropsContext<{ code: string; state: string }>
): Promise<{ props: PageProps | {} }> {
  const { code, state } = context.query ?? {};
  return { props: { code, state } };
}

export default function Auth({ code, state }: PageProps) {
  const [auth, setAuth] = useRecoilState(globalAuth);
  const [lists, setLists] = useState<TwitterLists>([]);
  const [profileImageUrl, setProfileImageUrl] = useState<string>('');

  useEffect(() => {
    if (auth.isFetching) return;

    setAuth({ ...auth, isFetching: true });
    (async () => {
      const res = await fetch(`/api/auth/me?code=${code}&state=${state}`);
      const { profile_image_url, lists } = await res.json();

      setLists(lists);
      setProfileImageUrl(profile_image_url);

      setAuth({ ...auth, isFetching: false });
    })();
  }, []);

  return (
    <div>
      <img src={profileImageUrl} alt="profile_image" />
      {lists.map((list) => (
        <div key={list.id}>{list.name}</div>
      ))}
      成功です！
    </div>
  );
}
