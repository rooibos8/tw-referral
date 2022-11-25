import { Twitter } from '@mui/icons-material';
import React from 'react';

import variables from '@/styles/variables.module.scss';

// @ts-ignore
export const TwitterIcon = ({ className, ...props }) => (
  <Twitter
    style={{ color: variables.twitterColor }}
    className={className}
    {...props}
  />
);