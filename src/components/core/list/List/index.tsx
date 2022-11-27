import { ClassNames } from '@emotion/react';
import clsx from 'clsx';
import React from 'react';

import styles from './style.module.scss';

type ListProps = {
  className?: string;
};

export const List: React.FC<React.PropsWithChildren<ListProps>> = ({
  children,
  className,
}) => {
  return <div className={clsx(styles.root, className)}>{children}</div>;
};
