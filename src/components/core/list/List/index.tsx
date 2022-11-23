import React from 'react';

import styles from './style.module.scss';
export const List: React.FC<React.PropsWithChildren> = ({ children }) => {
  return <div className={styles.root}>{children}</div>;
};
