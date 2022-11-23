import clsx from 'clsx';
import { InferGetServerSidePropsType } from 'next';
import { useTranslation } from 'next-i18next';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

import { ListItem, List, Title } from '@/components/core';
import { ArrowForwardIcon } from '@/components/icons';
import { Form } from '@/constants';
import * as api from '@/libs/api';

import { withSessionSsr } from '@/libs/session/client';
import styles from '@/styles/pages/mypage.module.scss';

export const getServerSideProps = withSessionSsr();

export default function Mypage(
  props: InferGetServerSidePropsType<typeof getServerSideProps>
) {
  const { t } = useTranslation();
  const [lists, setLists] = useState<Array<{ skeltonId: string; form?: Form }>>(
    []
  );
  const [activeLists, setActiveLists] = useState<Array<string>>([]);
  const [noList, setNoList] = useState<boolean>(false);

  useEffect(() => {
    // start loading
    let skeltonCounter = 0;
    const interval = setInterval(() => {
      ++skeltonCounter;
      const skeltonId = uuidv4();
      setLists((prev) => [...prev, { skeltonId }]);
      setTimeout(() => {
        setActiveLists((prev) => [...prev, skeltonId]);
      }, 200);
      if (skeltonCounter > 10) {
        clearInterval(interval);
      }
    }, 450);

    (async () => {
      const res = await api.getForms();
      if (res) {
        if (res.data.length === 0) {
          setNoList(true);
        }
        let listCount = 0;
        clearInterval(interval);

        for (const d of res.data) {
          const newSkeltonId = uuidv4();
          // @ts-ignore
          setLists((prev) => {
            prev.splice(listCount, 1, {
              skeltonId: prev[listCount]
                ? prev[listCount].skeltonId
                : newSkeltonId,
              form: d,
            });
            return prev;
          });

          setTimeout(() => {
            setActiveLists((prev) => {
              if (prev.length <= listCount + 1) {
                return prev;
              } else {
                return [...prev, newSkeltonId];
              }
            });
          }, 200);
          setLists((prev) => {
            if (prev.length < res.data.length) {
              const skeltonId = uuidv4();
              setTimeout(() => {
                setActiveLists((prev) => [...prev, skeltonId]);
              }, 200);
              return [...prev, { skeltonId }];
            } else {
              return prev;
            }
          });
          await new Promise((r) => setTimeout(r, 450));
          listCount++;
        }
      }
    })();
    return () => {
      clearInterval(interval);
    };
  }, []);

  return (
    <div className={styles['list-container']}>
      <Title>{t('yourList')}</Title>
      <List>
        {noList ? <>{t('noList')}</> : null}
        {lists.map((list) => (
          <>
            {typeof list.form !== 'undefined' ? (
              <Link
                key={list.skeltonId}
                href={`${
                  list.form.id
                    ? `/form/${list.form.id}`
                    : `/form/new?id=${list.form.twitter.id}&name=${list.form.twitter.name}`
                }`}
                className={clsx(styles['list-item-enter'], {
                  [styles['list-item-enter-active']]: activeLists.find(
                    (id) => id === list.skeltonId
                  ),
                })}
              >
                <ListItem>
                  {list.form.name}
                  <ArrowForwardIcon />
                </ListItem>
              </Link>
            ) : (
              <ListItem
                key={list.skeltonId}
                isLoading
                className={clsx(styles['list-item-enter'], {
                  [styles['list-item-enter-active']]: activeLists.find(
                    (s) => s === list.skeltonId
                  ),
                })}
              />
            )}
          </>
        ))}
      </List>
    </div>
  );
}
