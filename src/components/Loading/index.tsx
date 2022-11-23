import clsx from 'clsx';

import styles from './style.module.scss';

export const Loading = () => {
  return (
    <div className={styles.container}>
      <div className={clsx('sk-wave', styles['wave-container'])}>
        <div className={clsx('sk-wave-rect', styles.wave)}></div>
        <div className={clsx('sk-wave-rect', styles.wave)}></div>
        <div className={clsx('sk-wave-rect', styles.wave)}></div>
        <div className={clsx('sk-wave-rect', styles.wave)}></div>
        <div className={clsx('sk-wave-rect', styles.wave)}></div>
      </div>
      <div className={styles.mask}></div>
    </div>
  );
};
