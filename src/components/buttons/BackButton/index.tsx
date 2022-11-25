import { useTranslation } from 'next-i18next';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React from 'react';

import styles from './style.module.scss';

import type { LinkProps } from 'next/link';

import { Title } from '@/components/core';
import { ArrowBackIcon } from '@/components/icons';

const BackButton: React.FC<{
  href?: string;
}> = ({ href }) => {
  const { t } = useTranslation();
  const router = useRouter();
  const handleClickBack = () => {
    router.back();
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
