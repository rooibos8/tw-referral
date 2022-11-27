import clsx from 'clsx';
import React from 'react';

import styles from './style.module.scss';

export const FlagIcon: React.FC<{ locale?: string }> = ({ locale = 'jp' }) => {
  const l = locale === 'en' ? 'us' : locale;
  return (
    <div
      className={clsx(styles['icon-container'], styles[`icon-container-${l}`])}
    >
      <span className={clsx(styles[`icon-${l}`], `fi fi-${l}`)}></span>
    </div>
  );
};
