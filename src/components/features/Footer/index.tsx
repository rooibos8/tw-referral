import { GitHub, Twitter } from '@mui/icons-material';
import Link from 'next/link';
import React from 'react';

import styles from './style.module.scss';

export const Footer = () => {
  return (
    <footer className={styles.footer}>
      <Link
        href="https://github.com/rooibos8/tw-referral"
        target="_blank"
        rel="noreferrer noopener"
      >
        <GitHub className={styles.icon} />
      </Link>
      <Link
        href="https://twitter.com/rooibos_8"
        target="_blank"
        rel="noreferrer noopener"
      >
        <Twitter className={styles.icon} />
      </Link>
    </footer>
  );
};
