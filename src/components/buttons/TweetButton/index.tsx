import clsx from 'clsx';
import React from 'react';

import styles from './style.module.scss';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  onClick?: () => void;
}

/**
 * Primary UI component for user interaction
 */
const Button: React.FC<ButtonProps> = ({
  className,
  children,
  ...props
}: ButtonProps) => {
  return (
    <button type="button" className={clsx(styles.btn, className)} {...props}>
      {children}
    </button>
  );
};

export type { ButtonProps };
export { Button };
