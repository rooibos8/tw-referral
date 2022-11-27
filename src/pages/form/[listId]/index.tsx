import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';

import { useRecoilState } from 'recoil';

import { SwipableList } from '@/components';
import * as api from '@/libs/api';
import { UserInfo } from '@/libs/firebase';
import { withSessionSsr } from '@/libs/session/client';
import { UiState, uiState } from '@/store';

import styles from '@/styles/pages/form/[listId]/index.module.scss';
export const getServerSideProps = withSessionSsr();

export default function Appliers() {
  const [ui, setUi] = useRecoilState<UiState>(uiState);
  const { t } = useTranslation();
  const router = useRouter();
  const { listId } = router.query as { listId: string };
  const [appliers, setAppliers] = useState<
    Array<UserInfo & { allowed: number; denied: number }>
  >([]);
  const [fetchedAppliers, setFetchedAppliers] = useState<boolean>(false);

  useEffect(() => {
    setUi({ isLoading: true });
    if (!listId) return;
    (async () => {
      const res = await api.getAppliers(listId);
      if (res) {
        const { data } = res;
        setAppliers(data.map((d) => d.user));
      }
      setFetchedAppliers(true);
      setUi({ isLoading: false });
    })();
  }, [listId]);

  const handleOnAllow = async (applierId: string) => {
    const res = await api.allowApply({ listId, applierId });
    if (!res || !res.ok) {
      await api.backApply({ listId, applierId });
      return;
    }
    setAppliers((prev) => prev.filter((a) => a.doc_id !== applierId));
  };

  const handleOnDeny = async (applierId: string) => {
    const res = await api.denyApply({ listId, applierId });
    if (!res || !res.ok) {
      await api.backApply({ listId, applierId });
      return;
    }
    setAppliers((prev) => prev.filter((a) => a.doc_id !== applierId));
  };

  const handleOnClick = (applierId: string) => {
    router.push(`/form/${listId}/${applierId}`);
  };

  return (
    <div>
      {!ui.isLoading && appliers.length > 0 ? (
        <div className={styles['list-container']}>
          <SwipableList
            onClick={handleOnClick}
            onAllow={handleOnAllow}
            onDeny={handleOnDeny}
            appliers={appliers.map((a) => ({
              id: a.doc_id,
              name: a.twitter.name,
              username: a.twitter.username,
              profileImageUrl: a.twitter.profile_image_url,
              allowed: a.allowed,
              denied: a.denied,
              over19: a.ai_guessed_age_gt !== null && a.ai_guessed_age_gt >= 19,
            }))}
          />
        </div>
      ) : fetchedAppliers && appliers.length === 0 ? (
        <>
          <h3>{t('congratulations')}</h3>
          <p>{t('haveDoneAllRequests')}</p>
          {/* <p>{t('donateMessage')}</p> */}
        </>
      ) : null}
    </div>
  );
}
