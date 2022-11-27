import React from 'react';

import ArrowForwardIconSVG from '@/assets/svg/ArrowForwardIcon.svg';
import variables from '@/styles/variables.module.scss';

export const ArrowForwardIcon: React.FC<React.SVGAttributes<SVGElement>> = ({
  className,
  ...props
}) => (
  <ArrowForwardIconSVG
    style={{ fill: variables.blackColor }}
    className={className}
    {...props}
  />
);
