import { Check, DoNotDisturb } from '@mui/icons-material';
import { useTranslation } from 'next-i18next';
import React from 'react';
import { SwipeableList, Type as ListType } from 'react-swipeable-list';
import {
  LeadingActions,
  SwipeableListItem,
  SwipeAction,
  TrailingActions,
} from 'react-swipeable-list';
import 'react-swipeable-list/dist/styles.css';

import styles from './style.module.scss';

import { Text, Rate, UserProfile } from '@/components';
import { UserIcon } from '@/components/icons';

type SwipableListProps = {
  appliers: Array<{
    id: string;
    name: string;
    username: string;
    profileImageUrl: string;
    over19: boolean;
    allowed: number;
    denied: number;
  }>;
  onAllow: (id: string) => void;
  onDeny: (id: string) => void;
  onClick: (id: string) => void;
};

export const SwipableList: React.FC<SwipableListProps> = ({
  appliers,
  onAllow,
  onDeny,
  onClick,
}) => {
  const { t } = useTranslation();
  return (
    <div>
      <SwipeableList fullSwipe type={ListType.IOS}>
        {appliers.map(
          ({
            name,
            username,
            profileImageUrl,
            over19,
            id,
            allowed,
            denied,
          }) => (
            <SwipeableListItem
              key={id}
              className={styles['list-container']}
              leadingActions={
                <LeadingActions>
                  <SwipeAction destructive onClick={() => onAllow(id)}>
                    <div className={styles.accept}>
                      <Check />
                      <Text className={styles['action-text']} stress size="lg">
                        {t('allow')}
                      </Text>
                    </div>
                  </SwipeAction>
                </LeadingActions>
              }
              trailingActions={
                <TrailingActions>
                  <SwipeAction destructive onClick={() => onDeny(id)}>
                    <div className={styles.deny}>
                      <DoNotDisturb />
                      <Text className={styles['action-text']} stress size="lg">
                        {t('deny')}
                      </Text>
                    </div>
                  </SwipeAction>
                </TrailingActions>
              }
              onClick={() => onClick(id)}
            >
              <div className={styles['contents']}>
                <UserProfile
                  profileImageUrl={profileImageUrl}
                  name={name}
                  over19={over19}
                  username={username}
                />
                <Rate
                  className={styles['rate']}
                  allowedCount={allowed}
                  deniedCount={denied}
                />
              </div>
            </SwipeableListItem>
          )
        )}
      </SwipeableList>
    </div>
  );
};
