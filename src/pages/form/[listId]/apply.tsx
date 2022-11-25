import { match } from 'assert';

import { InferGetServerSidePropsType } from 'next';
import { useTranslation } from 'next-i18next';
import React, { useEffect } from 'react';

import { Loading, Title, UserIcon } from '@/components';
import { PostApplyApiResponse } from '@/constants';
import * as api from '@/libs/api';
import { hasSessionExpired, isValidSession } from '@/libs/session';
import { withSessionSsr } from '@/libs/session/client';

import styles from '@/styles/pages/form/[listId]/apply.module.scss';

// @ts-ignore
export const getServerSideProps = withSessionSsr(async function ({
  req,
  res,
  query,
}) {
  const { listId } = query as { listId?: string };
  if (!isValidSession(req.session) || hasSessionExpired(req.session)) {
    req.session.destroy();
    return {
      props: {
        listId: listId as string,
        needAuth: true,
        isAvailable: false,
        notFound: false,
      },
    };
  }

  const applyRes = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/form/apply`,
    {
      method: 'POST',
      body: JSON.stringify({ listId: listId }),
      headers: {
        cookie: req.headers.cookie as string,
      },
    }
  );
  const setCookie = applyRes.headers.get('set-cookie');
  if (setCookie !== null) {
    res.setHeader('set-cookie', setCookie);
  }

  if (applyRes.status === 406) {
    return {
      props: {
        notFound: false,
        needAuth: false,
        isAvailable: false,
      },
    };
  } else if (applyRes.status === 404) {
    return {
      props: {
        notFound: true,
      },
    };
  } else if (applyRes.status === 202) {
    return {
      props: {
        needAuth: true,
        listId: listId as string,
      },
    };
  }
  if (!applyRes.ok || typeof applyRes === 'undefined') {
    return {
      redirect: {
        destination: '/',
        permanent: false,
      },
    };
  }

  const { name, username, profile_image_url }: PostApplyApiResponse =
    await applyRes.json();

  const match = profile_image_url.match(/[^\/]+$/);

  return {
    props: {
      needAuth: false,
      listId: listId as string,
      name,
      userName: username,
      profileImageUrl:
        match !== null
          ? profile_image_url.replace(
              match[0],
              match[0].replace('normal', '400x400')
            )
          : profile_image_url,
      isAvailable: true,
      notFound: false,
    },
  };
});

export default function Apply({
  listId,
  name,
  userName,
  profileImageUrl,
  needAuth,
  isAvailable,
  notFound,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const { t } = useTranslation();
  useEffect(() => {
    if (needAuth) {
      (async () => {
        const res = await api.getAuthLink(`/form/${listId}/apply`);
        if (res) {
          const { authUrl } = res;
          location.href = authUrl;
        }
      })();
    }
  }, []);

  return (
    <div>
      <div className={styles.container}>
        {notFound ? (
          <div className={styles['main-message']}>
            <h1>{t('notFoundTitle')}</h1>
            <h3>{t('listNotFoundMessage')}</h3>
          </div>
        ) : needAuth === true ? (
          <>
            <h3>{t('navigateToTwitterAuth')}</h3>
            <Loading />
          </>
        ) : (
          <>
            <div className={styles['main-message']}>
              <UserIcon src={profileImageUrl ?? ''} size={120} />
              <div className={styles['user-name']}>
                <Title>{name}</Title>
                <span>{userName}</span>
              </div>
            </div>
            <div className={styles['sub-message']}>
              <h3>{isAvailable ? t('applied') : t('notAvailableList')}</h3>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
