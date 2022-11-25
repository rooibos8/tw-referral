import clsx from 'clsx';

import styles from './style.module.scss';

import { Loading } from '@/components/core';
import variables from '@/styles/variables.module.scss';

export const LoadingOverLay = () => {
  return (
    <div className={styles.container}>
      <Loading
        color={variables.defaultColor}
        classNames={{
          container: styles['wave-container'],
          wave: styles.wave,
        }}
      />
      <div className={styles.mask}></div>
    </div>
  );
};
