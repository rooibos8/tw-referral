import { useTranslation } from 'next-i18next';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React from 'react';

import styles from './style.module.scss';

import { Title } from '@/components/core';
import { ArrowBackIcon } from '@/components/icons';

const BACK_TO_LIST: Record<string, string> = {
  '/form/[listId]/[userId]': '/form/[listId]',
  '/form/[listId]': '/mypage',
  '/form/new': '/mypage',
};

const BackButton: React.FC<{
  href?: string;
}> = ({ href }) => {
  const { t } = useTranslation();
  const router = useRouter();
  const handleClickBack = () => {
    let url = BACK_TO_LIST[router.pathname];
    const { listId, userId } = router.query as {
      listId?: string;
      userId?: string;
    };
    url = url
      .replace('[listId]', listId ?? '')
      .replace('[userId]', userId ?? '');
    router.push(url);
  };

  return href ? (
    <Link href={href}>
      <div className={styles['button-container']}>
        <ArrowBackIcon className={styles['arrow-icon']} />
        <Title>{t('back')}</Title>
      </div>
    </Link>
  ) : (
    <div className={styles['button-container']} onClick={handleClickBack}>
      <ArrowBackIcon className={styles['arrow-icon']} />
      <Title>{t('back')}</Title>
    </div>
  );
};

export { BackButton };
