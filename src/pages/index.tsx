import { useTranslation } from 'next-i18next';
import React from 'react';

import { TwitterIcon, Button } from '@/components';

import * as api from '@/libs/api';
import { withSessionSsr } from '@/libs/session/client';
import styles from '@/styles/pages/top.module.scss';
// @ts-ignore
export const getServerSideProps = withSessionSsr();

export default function Top() {
  const { t } = useTranslation();
  const onClick = async () => {
    const res = await api.getAuthLink('/mypage');
    if (res) {
      location.href = res.authUrl;
    }
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
        <Button
          icon={<TwitterIcon className={''} />}
          className={styles['login-btn']}
          onClick={onClick}
        >
          {t('login')}
        </Button>
      </section>
    </article>
  );
}
