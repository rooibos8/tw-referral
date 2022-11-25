import clsx from 'clsx';
import React from 'react';

import { useMemo } from 'react';

import styles from './style.module.scss';

type RateProps = {
  className?: string;
  allowedCount: number;
  deniedCount: number;
};

export const Rate: React.FC<RateProps> = ({
  className,
  allowedCount,
  deniedCount,
}) => {
  const { allowedRate, deniedRate } = useMemo(() => {
    if (allowedCount === 0 && deniedCount === 0) {
      return { allowedRate: 0, deniedRate: 0 };
    }
    return {
      allowedRate:
        Math.floor((allowedCount / (allowedCount + deniedCount)) * 100) / 100,
      deniedRate:
        Math.floor((deniedCount / (allowedCount + deniedCount)) * 100) / 100,
    };
  }, [allowedCount, deniedCount]);

  return (
    <div className={clsx(styles.progress, className)}>
      <div className={styles['progress-bar-denied-wrapper']}>
        {deniedRate * 100}%
        <div
          style={{
            width: `calc((100% - 25px) * ${deniedRate})`,
          }}
          className={clsx(styles['progress-bar'], styles['history-denied'])}
        ></div>
      </div>
      <div className={styles['progress-bar-allowed-wrapper']}>
        <div
          style={{
            width: `calc((100% - 25px) * ${allowedRate})`,
          }}
          className={clsx(styles['progress-bar'], styles['history-allowed'])}
        ></div>
        {allowedRate * 100}%
      </div>
    </div>
  );
};
