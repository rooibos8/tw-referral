import React from 'react';

import ArrowBackIconSVG from '@/assets/svg/ArrowBackIcon.svg';
import variables from '@/styles/variables.module.scss';

export const ArrowBackIcon: React.FC<React.SVGAttributes<SVGElement>> = ({
  className,
  ...props
}) => (
  <ArrowBackIconSVG
    style={{ fill: variables.defaultColor }}
    className={className}
    {...props}
  />
);
