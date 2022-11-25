import clsx from 'clsx';
import React from 'react';

import Skeleton from 'react-loading-skeleton';

import styles from './style.module.scss';

type ListItemProps = {
  onClick?: () => void;
  className?: string;
  isLoading?: boolean;
};

export const ListItem: React.FC<React.PropsWithChildren<ListItemProps>> = ({
  children,
  onClick,
  className,
  isLoading = false,
}) => {
  return isLoading ? (
    <div className={clsx(styles.skelton, className)}>
      <Skeleton
        baseColor={'#ffffff'}
        highlightColor={'#ededed'}
        height="100%"
      />
    </div>
  ) : (
    <div className={clsx(styles.root, className)} onClick={onClick}>
      {children}
    </div>
  );
};
