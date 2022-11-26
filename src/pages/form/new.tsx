import { Checkbox } from '@mantine/core';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';

import { useRecoilState } from 'recoil';

import { Button, UrlCopy } from '@/components';
import * as api from '@/libs/api';
import { withSessionSsr } from '@/libs/session/client';
import { uiState } from '@/store';

import styles from '@/styles/pages/form/new.module.scss';

export const getServerSideProps = withSessionSsr(
  // @ts-ignore
  async ({ query, req, res }) => {
    const { id, name } = query;
    if (!req.session.user.data.can_create_form) {
      return {
        redirect: {
          destination: '/mypage',
          permanent: false,
        },
      };
    }
    if (typeof id !== 'string' || typeof name !== 'string') {
      console.log('id name not exists');
      return {
        notFound: true,
      };
    } else {
      console.log('list does not exists');
      const listRes = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/twitter/lists/${id}`,
        {
          headers: {
            cookie: req.headers.cookie as string,
          },
        }
      );
      const setCookie = listRes.headers.get('set-cookie');
      if (setCookie !== null) {
        res.setHeader('set-cookie', setCookie);
      }

      if (listRes.status === 404) {
        return {
          notFound: true,
        };
      }
    }
    return {
      props: {},
    };
  }
);

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
  }, [id, name]);

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

  return opened === false ? (
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
      <UrlCopy url={formUrl} />
    </div>
  );
}
