import React from 'react';

import { TwitterIcon, Button } from '@/components';
import styles from '@/styles/pages/top.module.scss';

export default function Top() {
  const onClick = async () => {
    const res = await fetch('/api/auth/twitter');
    const { authUrl } = await res.json();
    location.href = authUrl;
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
          アカウントでログイン
        </Button>
      </section>
    </article>
  );
}
