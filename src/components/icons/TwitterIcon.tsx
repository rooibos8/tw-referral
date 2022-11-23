import React from 'react';

import TwitterIconSVG from '@/assets/svg/TwitterIcon.svg';
import variables from '@/styles/variables.module.scss';

export const TwitterIcon: React.FC<React.SVGAttributes<SVGElement>> = ({
  className,
  ...props
}) => (
  <TwitterIconSVG
    style={{ fill: variables.twitterColor }}
    className={className}
    {...props}
  />
);
