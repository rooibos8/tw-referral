import { Twitter } from '@mui/icons-material';
import { SvgIconProps } from '@mui/material';
import React from 'react';

import variables from '@/styles/variables.module.scss';

// @ts-ignore
export const TwitterIcon: React.FC<SvgIconProps> = ({ ...props }) => (
  <Twitter style={{ color: variables.twitterColor }} {...props} />
);
