import { useTranslation } from 'next-i18next';
import React from 'react';

import { TwitterIcon, Button, Text } from '@/components';

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
      <section className={styles.section}>
        <h1>{t('serviceTitle')}</h1>
        <div className={styles.message}>
          {t('serviceDescription')
            .split('\n')
            .map((text) => (
              <Text key={text}>{text}</Text>
            ))}
          <Text size="sm">
            <i>{t('serviceDescription2')}</i>
          </Text>
        </div>
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
