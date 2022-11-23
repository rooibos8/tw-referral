import React, { useEffect } from 'react';

import { useRecoilValue, useSetRecoilState } from 'recoil';

import { Header, Loading } from '@/components';
import { SessionState, sessionState, uiState } from '@/store';
import styles from '@/styles/components/layout.module.scss';

type LayoutProps = {
  session: SessionState;
  children: React.ReactNode;
};

export default function Layout({ session, children }: LayoutProps) {
  const setSession = useSetRecoilState(sessionState);
  const ui = useRecoilValue(uiState);
  useEffect(() => {
    console.log('Layout!!!');
    console.log(session);
    setSession(session);
  }, [session]);
  return (
    <>
      <Header />
      {ui.isLoading ? <Loading /> : null}
      <main className={styles.main}>{children}</main>
    </>
  );
}
