import { VerifiedUser } from '@mui/icons-material';
import clsx from 'clsx';
import Link from 'next/link';
import React from 'react';

import styles from './style.module.scss';

import { UserIcon, Text, TwitterIcon } from '@/components';

type UserProfileProps = {
  href?: string;
  profileImageUrl: string;
  name: string;
  username: string;
  over19?: boolean;
};

export const UserProfile: React.FC<UserProfileProps> = (props) => {
  return props.href ? (
    <Link href={props.href} target="_blank" rel="noreferrer noopener">
      <Profile {...props} />
    </Link>
  ) : (
    <Profile {...props} />
  );
};

const Profile: React.FC<UserProfileProps> = ({
  href,
  profileImageUrl,
  name,
  username,
  over19,
}) => (
  <div className={styles['user-profile']}>
    <UserIcon size={45} src={profileImageUrl} />
    <div className={styles['user-profile-name']}>
      <div className={styles['user-profile-ai']}>
        <Text stress>{name}</Text>
        {href ? <TwitterIcon className={styles.icon} /> : null}
        {over19 ? (
          <span className={styles['ai-verified']}>
            <VerifiedUser
              className={clsx(styles['ai-verified-icon'], styles.icon)}
            />
            AI 19+
          </span>
        ) : null}
      </div>
      @{username}
    </div>
  </div>
);
