import clsx from 'clsx';
import React from 'react';

import styles from './style.module.scss';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  theme?: 'default' | 'primary' | 'warn' | 'error';
  size?: 'sm' | 'md' | 'xm' | 'lg';
  onClick?: () => void;
  icon?: React.ReactNode;
}

/**
 * Primary UI component for user interaction
 */
const Button: React.FC<ButtonProps> = ({
  theme = 'default',
  size = 'md',
  className,
  icon,
  children,
  ...props
}: ButtonProps) => {
  return (
    <button
      type="button"
      className={clsx(styles.btn, className, styles[theme], styles[size])}
      {...props}
    >
      <div className={styles.icon}>{icon ? <>{icon}</> : null}</div>
      <label>{children}</label>
    </button>
  );
};

export type { ButtonProps };
export { Button };
