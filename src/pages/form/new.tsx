import { Checkbox } from '@mantine/core';
import { CopyButton, Button as MTButton } from '@mantine/core';
import { TextInput } from '@mantine/core';
import clsx from 'clsx';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import { Share as ShareTweet } from 'react-twitter-widgets';

import { useRecoilState } from 'recoil';

import { Button, BackButton } from '@/components/buttons';
import { Text } from '@/components/core';
import * as api from '@/libs/api';
import { withSessionSsr } from '@/libs/session/client';
import { uiState } from '@/store';

import styles from '@/styles/pages/form/new.module.scss';

// @ts-ignore
export const getServerSideProps = withSessionSsr(async ({ query }) => {
  const { id, name } = query;
  if (typeof id !== 'string' || typeof name !== 'string') {
    console.log('id name not exists');
    return {
      notFound: true,
    };
  } else {
    console.log('lost does not exists');
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/twitter/lists/${id}`
    );
    if (res.status === 404) {
      return {
        notFound: true,
      };
    }
  }
  return {
    props: {},
  };
});

export default function New() {
  const { t } = useTranslation();
  const router = useRouter();
  const { id, name } = router.query as { id: string; name: string };
  const [formUrl, setFormUrl] = useState<string>('');
  const [list, setList] = useState<{ id: string; name: string }>({
    id: '',
    name: '',
  });
  const [ui, setUi] = useRecoilState(uiState);
  const [opened, setOpened] = useState<boolean>(false);
  const [importExistsAccount, setImportExistsAccount] =
    useState<boolean>(false);

  useEffect(() => {
    setList({
      id,
      name,
    });
  }, []);
  useEffect(() => {
    if (ui.isLoading && formUrl !== '') {
      setUi({ isLoading: false });
    }
  }, [formUrl]);

  const handleClickOpen = async () => {
    try {
      setUi({ isLoading: true });
      const res = await api.openForm({ twListId: id, importExistsAccount });
      if (res) {
        const { newId } = res;
        setOpened(true);
        setFormUrl(`${process.env.NEXT_PUBLIC_BASE_URL}/form/${newId}/apply`);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <>
      <BackButton href="/mypage" />
      {opened === false ? (
        <div className={styles.container}>
          <div className={styles['main-message']}>
            <h1>{list.name}</h1>
            <h3>{t('getToOpenForm')}</h3>
          </div>
          <label className={styles['sub-message']}>
            <Checkbox
              classNames={{
                label: styles['checkbox-label'],
              }}
              label={t('importExistsMember')}
              onChange={() => setImportExistsAccount((prev) => !prev)}
            />
          </label>
          <Button size="lg" onClick={handleClickOpen}>
            {t('openForm')}
          </Button>
        </div>
      ) : (
        <div className={styles.container}>
          <div className={styles['main-message']}>
            <h3>{t('openedForm')}</h3>
          </div>
          <div className={styles.share}>
            <div>
              <ShareTweet url={formUrl} options={{ size: 'large' }} />
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
                value={formUrl}
              />
              <CopyButton value={formUrl}>
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
        </div>
      )}
    </>
  );
}
