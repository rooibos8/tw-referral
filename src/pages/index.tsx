import { useTranslation } from 'next-i18next';
// import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import React from 'react';

import { TwitterIcon, Button } from '@/components';

import * as api from '@/libs/api';
import { withSessionSsr } from '@/libs/session/client';
import styles from '@/styles/pages/top.module.scss';
// @ts-ignore
export const getServerSideProps = withSessionSsr();

// export const getServerSideProps = withSessionSsr(async ({ locale }) => ({
//   props: {
//     ...(await serverSideTranslations(locale ?? 'jp', ['common'])),
//   },
// }));

export default function Top() {
  const { t } = useTranslation();
  const onClick = async () => {
    const res = await api.getAuthLink('/mypage');
    if (res) {
      location.href = res.authUrl;
    }
    // const res = await fetch(
    //   `/api/auth/me?returnUrl=${encodeURIComponent('/mypage')}`
    // );
    // const { authUrl } = await res.json();
  };

  return (
    <article>
      <section>
        <h1>
          Twitterユーザーの年齢判定を
          <br />
          共有するツール
        </h1>
        <p>
          成人向けコンテンツをTwitterでリスト公開したい時アカウントの年齢確認をするのが大変なのでツールを作りました！
        </p>
        <p>
          １人で確認するのが大変ならみんなで結果をシェアすればいいじゃない！ ――
          制作
        </p>
        <Button className={styles['login-btn']} onClick={onClick}>
          <TwitterIcon />
          {t('login')}
        </Button>
      </section>
    </article>
  );
}
