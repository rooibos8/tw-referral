import React from 'react';

import { TwitterIcon, Button } from '@/components';
import styles from '@/styles/index.module.scss';

type User = {
  name: string;
};

const Page: React.FC = () => {
  const [user, setUser] = React.useState<User>();

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
        <Button className={styles['login-btn']}>
          <TwitterIcon />
          アカウントでログイン
        </Button>
      </section>
    </article>
  );
};

export default Page;
