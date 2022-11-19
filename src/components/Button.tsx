import clsx from 'clsx';
import React from 'react';

import styles from '@/styles/components/button.module.scss';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  theme?: 'default' | 'primary' | 'warn' | 'error';
  size?: 'small' | 'medium' | 'large';
  onClick?: () => void;
}

/**
 * Primary UI component for user interaction
 */
const Button: React.FC<ButtonProps> = ({
  theme = 'default',
  size = 'medium',
  className,
  children,
  ...props
}: ButtonProps) => {
  return (
    <button
      type="button"
      className={clsx(styles.btn, className, styles[theme], styles[size])}
      {...props}
    >
      {children}
    </button>
  );
};

export type { ButtonProps };
export { Button };
