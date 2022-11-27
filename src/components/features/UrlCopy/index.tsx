import { CopyButton, Button as MTButton } from '@mantine/core';
import { TextInput } from '@mantine/core';
import clsx from 'clsx';
import { useTranslation } from 'next-i18next';
import React from 'react';
import { Share as ShareTweet } from 'react-twitter-widgets';

import styles from './style.module.scss';

import { Text } from '@/components/core';

type UrlCopyProp = {
  url: string;
};

export const UrlCopy = ({ url }: UrlCopyProp) => {
  const { t } = useTranslation();
  return (
    <div className={styles.share}>
      <div>
        <ShareTweet url={url} options={{ size: 'large' }} />
      </div>
      <div>
        <Text>{t('or')}</Text>
      </div>
      <div className={styles['share-copy']}>
        <TextInput
          classNames={{
            root: styles['copy-url-root'],
            input: styles['copy-url-input'],
          }}
          variant="unstyled"
          defaultValue={url}
        />
        <CopyButton value={url}>
          {({ copied, copy }) => (
            <MTButton
              className={clsx({
                [styles['copy-button-copied']]: copied,
                [styles['copy-button']]: !copied,
              })}
              onClick={copy}
            >
              {copied ? t('copiedUrl') : t('doCopyUrl')}
            </MTButton>
          )}
        </CopyButton>
      </div>
    </div>
  );
};
