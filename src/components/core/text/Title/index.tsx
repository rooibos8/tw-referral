import clsx from 'clsx';
import React from 'react';

import styles from './style.module.scss';

type TitleProps = {
  className?: string;
};

export const Title: React.FC<React.PropsWithChildren<TitleProps>> = ({
  className,
  children,
}) => {
  return <span className={clsx(styles.root, className)}>{children}</span>;
};
