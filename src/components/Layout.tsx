import React from 'react';

import { Header } from '@/components';
import styles from '@/styles/components/layout.module.scss';

type LayoutProps = {
  children: React.ReactNode;
};

export default function Layout({ children }: LayoutProps) {
  return (
    <>
      <Header />
      <main className={styles.main}>{children}</main>
    </>
  );
}
