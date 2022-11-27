import clsx from 'clsx';
import Image from 'next/image';
import React from 'react';

import styles from './style.module.scss';

type UserIconProp = {
  src: string;
  size?: number;
  className?: string;
};

export const UserIcon: React.FC<UserIconProp> = ({
  src,
  size = 38,
  className,
}) => {
  return (
    <Image
      className={clsx(styles.root, className)}
      width={size}
      height={size}
      src={src}
      alt="Picture of the user"
    />
  );
};
