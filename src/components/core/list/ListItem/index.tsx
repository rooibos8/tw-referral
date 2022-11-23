import clsx from 'clsx';
import React from 'react';

import Skeleton from 'react-loading-skeleton';

import styles from './style.module.scss';

import variables from '@/styles/variables.module.scss';

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
  return (
    <div className={clsx(styles.root, className)} onClick={onClick}>
      {isLoading ? (
        <div className={styles.skelton}>
          <Skeleton
            baseColor={variables.skeltonBaseColor}
            width="85%"
            height="100%"
          />
        </div>
      ) : (
        children
      )}
    </div>
  );
};
