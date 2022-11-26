import { Badge } from '@mantine/core';
import { Close } from '@mui/icons-material';
import clsx from 'clsx';
import { useTranslation } from 'next-i18next';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';

import { UserProfile } from '@/components';
import { ListItem, List, Title } from '@/components/core';
import { ArrowForwardIcon } from '@/components/icons';
import { APPLY_STATUS, Form } from '@/constants';
import * as api from '@/libs/api';

import { ListFormApplierDoc, UserInfo } from '@/libs/firebase';
import { withSessionSsr } from '@/libs/session/client';
import { uiState } from '@/store';
import { formState } from '@/store/form';
import styles from '@/styles/pages/mypage.module.scss';

// @ts-ignore
export const getServerSideProps = withSessionSsr(async ({ req }) => {
  if (!req.session.user.data.can_create_form) {
    req.session.destroy();
    return {
      redirect: {
        destination: '/',
        permanent: false,
      },
    };
  }
});

// @ts-ignore
export default function Mypage({ session }) {
  const { t } = useTranslation();
  const [lists, setLists] = useState<Array<{ skeltonId: string; form?: Form }>>(
    []
  );
  const [requests, setRequests] = useState<Array<ListFormApplierDoc>>([]);
  const [activeLists, setActiveLists] = useState<Array<string>>([]);
  const [formGlobal, setFormGlobal] = useRecoilState(formState);
  const [ui, setUiGlobal] = useRecoilState(uiState);

  useEffect(() => {
    (async () => {
      setUiGlobal({ isLoading: true });
      await Promise.all([
        // 追加待ちのリストを取得
        // (async () => {
        //   const res = await api.getApply();
        //   if (!res) return;
        //   for (const d of res.data) {
        //     setRequests((prev) => [...prev, d]);
        //     setTimeout(() => {
        //       setActiveLists((prev) => [...prev, d.doc_id]);
        //     }, 200);
        //   }
        // })(),
        // 自分のリストを取得
        (async () => {
          if (!session.user.data.can_create_form) {
            return;
          }
          if (formGlobal.data.length > 0) {
            setLists(
              formGlobal.data.map((d) => ({
                form: d,
                skeltonId: d.id ?? d.twitter.id,
              }))
            );
            setActiveLists(formGlobal.data.map((d) => d.id ?? d.twitter.id));
            return;
          }

          let data: Array<Form> = [];
          const res = await api.getForms();
          if (!res) return;
          data = res.data;
          setFormGlobal({
            data: data as Array<
              Form & {
                appliers?: Array<
                  UserInfo & { allowed: number; denied: number }
                >;
              }
            >,
          });

          if (data.length === 0) {
            return;
          }
          for (const d of data) {
            setLists((prev) => [
              ...prev,
              {
                skeltonId: d.id ?? d.twitter.id,
                form: d,
              },
            ]);
            setTimeout(() => {
              setActiveLists((prev) => [...prev, d.id ?? d.twitter.id]);
            }, 200);
            await new Promise((r) => setTimeout(r, 300));
          }
        })(),
      ]);
      setUiGlobal({ isLoading: false });
    })();
  }, []);

  return (
    <div className={styles['container']}>
      {session.user.data.can_create_form ? (
        <>
          <Title>{t('yourList')}</Title>
          <List className={styles.list}>
            {lists.length === 0 ? (
              <>{t('noList')}</>
            ) : (
              lists.map((list) => (
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
                          <Badge
                            classNames={{
                              root: styles['list-badge-root'],
                              inner: styles['list-badge-label'],
                            }}
                          >
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
              ))
            )}
          </List>
        </>
      ) : null}
      {/* <Title>{t('yourRequest')}</Title>
      <List className={styles.list}>
        {requests.length === 0 ? (
          <>{t('noRequest')}</>
        ) : (
          requests.map((request) => (
            <ListItem
              key={request.data.owner.list_doc_id}
              className={clsx(styles['list-item-enter'], {
                [styles['list-item-enter-active']]: activeLists.find(
                  (id) => id === request.data.owner.list_doc_id
                ),
              })}
            >
              <div className={styles['list-item']}>
                <UserProfile
                  profileImageUrl={request.data.owner.twitter.profile_image_url}
                  name={request.data.owner.twitter.name}
                  username={request.data.owner.twitter.username}
                />
                <div>
                  {request.data.status === APPLY_STATUS.DENY
                    ? t('didNotAdd')
                    : request.data.status === APPLY_STATUS.ALLOW
                    ? t('added')
                    : null}
                </div>
                <div>
                  {request.data.status !== APPLY_STATUS.STAY ? <Close /> : null}
                </div>
              </div>
            </ListItem>
          ))
        )}
      </List> */}
    </div>
  );
}
