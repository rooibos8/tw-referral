import { Modal } from '@mantine/core';
import { DoNotDisturb, DoneAll, OpenInNew, Check } from '@mui/icons-material';
import clsx from 'clsx';
import { Timestamp } from 'firebase/firestore/lite';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import { Timeline } from 'react-twitter-widgets';

import { useRecoilState } from 'recoil';

import type { UiState } from '@/store';

import { Button, UserProfile, Text, Loading } from '@/components';
import { GetTwitterProfileApiResponse } from '@/constants';
import * as api from '@/libs/api';
import { JudgeHistory, UserDoc } from '@/libs/firebase';
import { withSessionSsr } from '@/libs/session/client';
import { TwitterProfile } from '@/libs/twitter';

import { uiState } from '@/store';
import styles from '@/styles/pages/form/[listId]/[userId].module.scss';

export const getServerSideProps = withSessionSsr();

export default function New() {
  const { t } = useTranslation();
  const [ui, setUi] = useRecoilState<UiState>(uiState);
  const router = useRouter();
  const { userId, listId } = router.query as { userId: string; listId: string };
  const [opened, setOpened] = useState<boolean>(false);
  const [selected, setSelected] = useState<GetTwitterProfileApiResponse>();
  const [applier, setApplier] = useState<
    UserDoc & { twitter: TwitterProfile }
  >();
  const [allowedHistory, setAllowedHistory] = useState<Array<JudgeHistory>>([]);
  const [deniedHistory, setDeniedHistory] = useState<Array<JudgeHistory>>([]);
  const [judge, setJudge] = useState<{ allowed: number; denied: number }>({
    allowed: 0,
    denied: 0,
  });
  const [isFrameLoading, setIsFrameLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!userId) return;

    (async () => {
      setUi({ isLoading: true });
      const res = await api.getTwitterProfile(userId);
      if (res) {
        let { twitter, ...data } = res;
        setApplier({ ...data, twitter });
      }
      setUi({ isLoading: false });
    })();

    (async () => {
      const res = await api.getJudgeHistory(userId);
      if (!res) return;
      const { data } = res;
      setAllowedHistory(data.allowed);
      setDeniedHistory(data.denied);
      const allowed = Math.floor(
        (data.allowed.length / (data.allowed.length + data.denied.length)) * 100
      );
      const denied = Math.floor(
        (data.denied.length / (data.allowed.length + data.denied.length)) * 100
      );
      setJudge({
        allowed: isNaN(allowed) ? 0 : allowed,
        denied: isNaN(denied) ? 0 : denied,
      });
    })();
  }, [userId]);

  const handleClickShowHistory = () => {
    setOpened(true);
  };

  const handleClickAllow = async () => {
    setUi({ isLoading: true });
    await api.allowApply({ listId, applierId: userId });
    router.push(`/form/${listId}`);
    setUi({ isLoading: false });
  };

  const handleClickDeny = async () => {
    setUi({ isLoading: true });
    await api.denyApply({ listId, applierId: userId });
    router.push(`/form/${listId}`);
    setUi({ isLoading: false });
  };

  return (
    <>
      {typeof applier !== 'undefined' ? (
        <div className={styles['twitter-profile-container']}>
          <div>
            <div className={styles['twitter-user-name']}>
              <UserProfile
                href={`https://twitter.com/${applier.twitter?.username}`}
                profileImageUrl={applier.twitter?.profile_image_url ?? ''}
                name={applier.twitter?.name ?? ''}
                username={applier.twitter?.username ?? ''}
              />
              <Text size="sm">
                {t('joined')}
                {applier?.twitter?.created_at
                  ? new Date(applier?.twitter?.created_at).toLocaleDateString()
                  : ''}
              </Text>
            </div>
            <div className={styles['twitter-description']}>
              <Text>{applier?.twitter?.description ?? ''}</Text>
            </div>
            <div className={styles['twitter-public-metrics']}>
              <Text size="sm">
                {applier?.twitter?.public_metrics.following_count}
                {t('followingCount')}
              </Text>
              <Text size="sm">
                {applier?.twitter?.public_metrics.followers_count}
                {t('followerCount')}
              </Text>
              <Text size="sm">
                {applier?.twitter?.public_metrics.tweet_count}
                {t('tweetCount')}
              </Text>
            </div>
          </div>
          <div className={styles['judge-history-grid']}>
            <Text className={styles['judge-history-grid-header']}>
              {t('aiGuessed')}
            </Text>
            <Text stress>
              {!applier.data.ai_guessed_age_gt &&
              !applier.data.ai_guessed_age_ls ? (
                t('aiSayNothing')
              ) : (
                <>
                  {applier.data.ai_guessed_age_gt || ''}〜
                  {applier.data.ai_guessed_age_ls || ''}
                  {t('yearsOld')}
                </>
              )}
            </Text>
            <div
              className={styles['view-other-users-judge']}
              onClick={handleClickShowHistory}
            >
              <Text>{t('otherUsersJudgement')}</Text>
              <OpenInNew />
            </div>
            <div className={styles['judge-history-other-users']}>
              <div className={styles['text-with-icon']}>
                <DoneAll className={styles['icon-done']} />
                <Text stress>{judge.allowed}%</Text>
              </div>
              <div className={styles['text-with-icon']}>
                <DoNotDisturb className={styles['icon-deny']} />
                <Text stress>{judge.denied}%</Text>
              </div>
            </div>
          </div>
          <div className={styles['timeline']}>
            {isFrameLoading ? (
              <div className={styles['timeline-loading']}>
                <Loading />
              </div>
            ) : null}
            <Timeline
              onLoad={() => {
                setIsFrameLoading(false);
              }}
              dataSource={{
                sourceType: 'profile',
                screenName: applier.twitter?.username,
              }}
            />
          </div>
          <div className={styles['judge-button-group']}>
            <Button
              icon={<Check />}
              size="xm"
              theme="primary"
              onClick={handleClickAllow}
            >
              {t('allow')}
            </Button>
            <Button
              size="xm"
              theme={'warn'}
              icon={<DoNotDisturb />}
              onClick={handleClickDeny}
            >
              {t('deny')}
            </Button>
          </div>
        </div>
      ) : null}
      <Modal
        opened={opened}
        onClose={() => setOpened(false)}
        classNames={{
          root: styles['modal'],
          modal: styles['modal-root'],
          body: styles['modal-body'],
          header: styles['modal-header'],
          close: styles['modal-close'],
        }}
        fullScreen
        transition="slide-up"
      >
        <Text className={styles['modal-text-with-icon']}>
          <DoneAll
            className={clsx(styles['modal-icon'], styles['modal-icon-allow'])}
          />
          {t('whoAllowThisUser')}
        </Text>
        <div className={styles['modal-list']}>
          {allowedHistory.map((h) => (
            <div key={h.doc_id} className={styles['modal-list-item']}>
              <UserProfile
                profileImageUrl={h.data.twitter.profile_image_url}
                name={h.data.twitter.name}
                username={h.data.twitter.username}
              />
              <Text>{new Date(h.data.judged_at).toLocaleDateString()}</Text>
            </div>
          ))}
        </div>
        <Text className={styles['modal-text-with-icon']}>
          <DoNotDisturb
            className={clsx(styles['modal-icon'], styles['modal-icon-deny'])}
          />
          {t('whoDenyThisUser')}
        </Text>
        <div className={styles['modal-list']}>
          {deniedHistory.map((h) => (
            <div key={h.doc_id} className={styles['modal-list-item']}>
              <UserProfile
                profileImageUrl={h.data.twitter.profile_image_url}
                name={h.data.twitter.name}
                username={h.data.twitter.username}
              />
              <Text>{new Date(h.data.judged_at).toLocaleDateString()}</Text>
            </div>
          ))}
        </div>
      </Modal>
    </>
  );
}
