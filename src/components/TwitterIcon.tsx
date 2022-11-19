import clsx from 'clsx';
import React from 'react';

import TwitterIconSVG from '@/assets/svg/TwitterIcon.svg';
import styles from '@/styles/components/twitter-icon.module.scss';

type TwitterIconProps = React.SVGAttributes<SVGElement>;

const TwitterIcon: React.FC<TwitterIconProps> = ({
  className,
  ...props
}: TwitterIconProps) => {
  return <TwitterIconSVG className={clsx(styles.icon, className)} {...props} />;
};

export type { TwitterIconProps };
export { TwitterIcon };
