import Link from 'next/link';
import React from 'react';

import type { LinkProps } from 'next/link';

type BackButtonProps = React.PropsWithChildren<LinkProps>;

const BackButton: React.FC<BackButtonProps> = ({ children, ...props }) => {
  return <Link {...props}>{children}</Link>;
};

export { BackButton };
