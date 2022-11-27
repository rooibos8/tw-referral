import clsx from 'clsx';
import React from 'react';

import styles from './style.module.scss';

type TextProps = {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  stress?: boolean;
};

export const Text: React.FC<React.PropsWithChildren<TextProps>> = ({
  className,
  size = 'md',
  stress = false,
  children,
}) => {
  return (
    <label
      className={clsx(styles.root, styles[size], className, {
        [styles.stress]: stress,
      })}
    >
      {children}
    </label>
  );
};
