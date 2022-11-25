import { Badge } from '@mantine/core';
import clsx from 'clsx';
import { InferGetServerSidePropsType } from 'next';
import { useTranslation } from 'next-i18next';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import { useRecoilState } from 'recoil';
import { v4 as uuidv4 } from 'uuid';

import { ListItem, List, Title } from '@/components/core';
import { ArrowForwardIcon } from '@/components/icons';
import { Form } from '@/constants';
import * as api from '@/libs/api';

import { UserInfo } from '@/libs/firebase';
import { withSessionSsr } from '@/libs/session/client';
import { uiState } from '@/store';
import { formState } from '@/store/form';
import styles from '@/styles/pages/mypage.module.scss';

export const getServerSideProps = withSessionSsr();

export default function Mypage() {
  const { t } = useTranslation();
  const [lists, setLists] = useState<Array<{ skeltonId: string; form?: Form }>>(
    []
  );
  const [activeLists, setActiveLists] = useState<Array<string>>([]);
  const [noList, setNoList] = useState<boolean>(false);
  const [form, setForm] = useRecoilState(formState);
  const [ui, setUi] = useRecoilState(uiState);

  useEffect(() => {
    if (form.data.length > 0) {
      setLists(
        form.data
          .map((d) => ({ form: d, skeltonId: d.id ?? d.twitter.id }))
          .slice()
      );
      setActiveLists(form.data.map((d) => d.id ?? d.twitter.id).slice());
      return;
    }

    setUi({ isLoading: true });
    const skeltonId = uuidv4();

    (async () => {
      let data: Array<Form> = [];
      const res = await api.getForms();
      if (!res) return;
      data = res.data;
      setForm({
        data: data as Array<
          Form & {
            appliers?: Array<UserInfo & { allowed: number; denied: number }>;
          }
        >,
      });
      setUi({ isLoading: false });

      if (data.length === 0) {
        setNoList(true);
        return;
      }
      for (let i = 0; i < data.length; i++) {
        const d = data[i];
        setLists((prev) => {
          prev.splice(i, 1, {
            skeltonId: d.id ?? d.twitter.id,
            form: d,
          });
          return prev.slice();
        });
        setTimeout(() => {
          setActiveLists((prev) => {
            if (prev.length >= data.length) {
              return prev;
            } else {
              return [...prev, d.id ?? d.twitter.id];
            }
          });
        }, 200);
        await new Promise((r) => setTimeout(r, 300));
      }
    })();
  }, []);

  return (
    <div className={styles['list-container']}>
      <Title>{t('yourList')}</Title>
      <List>
        {noList ? <>{t('noList')}</> : null}
        {lists.map((list) => (
          <ListItem
            key={list.skeltonId}
            className={clsx(styles['list-item-enter'], {
              [styles['list-item-enter-active']]: activeLists.find(
                (id) => id === list.skeltonId
              ),
            })}
          >
            {typeof list.form !== 'undefined' ? (
              <Link
                className={styles['list-item']}
                href={`${
                  list.form.id
                    ? `/form/${list.form.id}`
                    : `/form/new?id=${list.form.twitter.id}&name=${list.form.twitter.name}`
                }`}
              >
                {list.form.name}
                <div>
                  {list.form.appliers.length > 0 ? (
                    <Badge>
                      {list.form.appliers.length > 99
                        ? '99+'
                        : list.form.appliers.length}
                    </Badge>
                  ) : null}
                </div>
                <ArrowForwardIcon />
              </Link>
            ) : null}
          </ListItem>
        ))}
      </List>
    </div>
  );
}
