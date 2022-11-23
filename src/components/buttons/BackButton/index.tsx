import { useTranslation } from 'next-i18next';
import Link from 'next/link';
import React from 'react';

import styles from './style.module.scss';

import type { LinkProps } from 'next/link';

import { Title } from '@/components/core';
import { ArrowBackIcon } from '@/components/icons';

type BackButtonProps = React.PropsWithChildren<LinkProps>;

const BackButton: React.FC<BackButtonProps> = ({ children, ...props }) => {
  const { t } = useTranslation();
  return (
    <Link {...props}>
      <div className={styles['button-container']}>
        <ArrowBackIcon className={styles['arrow-icon']} />
        <Title>{t('back')}</Title>
        {/* {children} */}
      </div>
    </Link>
  );
};

export { BackButton };
