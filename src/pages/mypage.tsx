import { withIronSessionSsr } from 'iron-session/next';
import { InferGetServerSidePropsType } from 'next';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';

import { Form, GetFormApiResponse } from '@/constants';
import { sessionOptions } from '@/libs/session';

export const getServerSideProps = withIronSessionSsr(async function ({ req }) {
  const { profile_image_url } = req.session.twitter.profile;
  return {
    props: {
      profileImageUrl: profile_image_url,
    },
  };
}, sessionOptions);

export default function Mypage({
  profileImageUrl,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const [lists, setLists] = useState<Array<Form>>([]);

  useEffect(() => {
    (async () => {
      const res = await fetch('/api/form', {
        redirect: 'follow',
      });
      const { data }: GetFormApiResponse = await res.json();
      setLists(data);
    })();
  }, []);

  return (
    <div>
      <img src={profileImageUrl} alt="profile_image" />
      {lists.map((list) => (
        <div key={list.id}>
          {list.id ? (
            <Link href={`/form/${list.id}`}>{list.name}</Link>
          ) : (
            <Link
              href={`/form/new?id=${list.twitter.id}&name=${list.twitter.name}`}
            >
              {list.name}
            </Link>
          )}
        </div>
      ))}
    </div>
  );
}
