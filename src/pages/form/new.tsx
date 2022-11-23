import { withIronSessionSsr } from 'iron-session/next';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';

import { Button, BackButton } from '@/components';
import { sessionOptions } from '@/libs/session';

export const getServerSideProps = withIronSessionSsr(async function ({
  query,
}) {
  const { id, name } = query;
  if (typeof id !== 'string' || typeof name !== 'string') {
    return {
      notFound: true,
    };
  }
  return {
    props: {},
  };
},
sessionOptions);

export default function New() {
  const router = useRouter();
  const { id, name } = router.query as { id: string; name: string };

  const [list, setList] = useState<{ id: string; name: string }>({
    id: '',
    name: '',
  });
  const [opened, setOpened] = useState<boolean>(false);
  const [importExistsAccount, setImportExistsAccount] =
    useState<boolean>(false);
  const [newListFormId, setNewListFormId] = useState<string>('');

  useEffect(() => {
    setList({
      id,
      name,
    });
  }, []);

  const handleClickOpen = async () => {
    try {
      const res = await fetch('/api/form', {
        method: 'POST',
        body: JSON.stringify({
          twListId: list.id,
          importExistsAccount,
        }),
      });
      const { newId } = await res.json();
      setNewListFormId(newId);
      setOpened(true);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <BackButton href="/mypage">戻る</BackButton>
      {opened === false ? (
        <>
          {list.name}で受付を開始しますか？
          <label>
            <input
              type="checkbox"
              onChange={() => setImportExistsAccount((prev) => !prev)}
            />
            リスト内のアカウントは全て19歳以上です
          </label>
          <Button onClick={handleClickOpen}>受付を開始する</Button>
        </>
      ) : (
        <>
          受付を開始しました！
          {`${process.env.NEXT_PUBLIC_BASE_URL}/form/${newListFormId}/apply`}
        </>
      )}
    </div>
  );
}
