import React from 'react';

import MenuIconSVG from '@/assets/svg/MenuIcon.svg';
import variables from '@/styles/variables.module.scss';

export const ArrowBackIcon: React.FC<React.SVGAttributes<SVGElement>> = ({
  className,
  ...props
}) => (
  <MenuIconSVG
    style={{ fill: variables.defaultColor }}
    className={className}
    {...props}
  />
);
