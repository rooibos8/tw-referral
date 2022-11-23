import clsx from 'clsx';
import React from 'react';

import styles from './style.module.scss';

import variables from '@/styles/variables.module.scss';

type LoadingProps = {
  classNames?: {
    container?: string;
    wave?: string;
  };
  color?: string;
};

export const Loading: React.FC<LoadingProps> = ({
  classNames,
  color = variables.defaultColor,
}) => {
  return (
    <div
      className={clsx(
        'sk-wave',
        styles['wave-container'],
        classNames?.container
      )}
    >
      <div
        className={clsx('sk-wave-rect', classNames?.wave)}
        style={{ backgroundColor: color }}
      ></div>
      <div
        className={clsx('sk-wave-rect', classNames?.wave)}
        style={{ backgroundColor: color }}
      ></div>
      <div
        className={clsx('sk-wave-rect', classNames?.wave)}
        style={{ backgroundColor: color }}
      ></div>
      <div
        className={clsx('sk-wave-rect', classNames?.wave)}
        style={{ backgroundColor: color }}
      ></div>
      <div
        className={clsx('sk-wave-rect', classNames?.wave)}
        style={{ backgroundColor: color }}
      ></div>
    </div>
  );
};
