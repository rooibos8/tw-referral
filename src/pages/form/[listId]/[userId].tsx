import { Modal } from '@mantine/core';
import { DoNotDisturb, DoneAll, OpenInNew, Check } from '@mui/icons-material';
import { Timestamp } from 'firebase/firestore/lite';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import { Timeline } from 'react-twitter-widgets';

import { useRecoilState } from 'recoil';

import type { UiState } from '@/store';

import { Button, UserProfile, Text, TwitterIcon } from '@/components';
import { GetTwitterProfileApiResponse } from '@/constants';
import * as api from '@/libs/api';
import { JudgeHistoryDoc, UserDoc } from '@/libs/firebase';
import { withSessionSsr } from '@/libs/session/client';
import { Tweet, TwitterProfile } from '@/libs/twitter';

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
    UserDoc & { twitter?: TwitterProfile }
  >();
  const [tweets, setTweets] = useState<Array<Tweet>>([]);
  const [allowedHistory, setAllowedHistory] = useState<Array<JudgeHistoryDoc>>(
    []
  );
  const [deniedHistory, setDeniedHistory] = useState<Array<JudgeHistoryDoc>>(
    []
  );
  const [judge, setJudge] = useState<{ allowed: number; denied: number }>({
    allowed: 0,
    denied: 0,
  });

  useEffect(() => {
    if (!userId) return;

    (async () => {
      setUi({ isLoading: true });
      // const res = {
      //   doc_id: '6ciDn1GTK0nqMsPzs856',
      //   twitter_id: '1336003094891515904',
      //   data: {
      //     twitter: {
      //       name: 'Newclientbeta',
      //       username: 'newclientbeta',
      //       id: '1336003094891515904',
      //       profile_image_url:
      //         'https://pbs.twimg.com/profile_images/1338471056525291527/bw-yNZ8K_normal.jpg',
      //     },
      //     ai_guessed_age_gt: 0,
      //     language: 'jp',
      //     denied: 0,
      //     ai_guessed_age_ls: 0,
      //     allowed: 0,
      //     created_at: Timestamp.now(),
      //     updated_at: Timestamp.now(),
      //   },
      //   twitter: {
      //     protected: false,
      //     name: 'Newclientbeta',
      //     id: '1336003094891515904',
      //     description:
      //       'I will deliver a new twitter client app for taking safety communication to everyone who attacked by anonymous account on Twitter. Please waiting.',
      //     profile_image_url:
      //       'https://pbs.twimg.com/profile_images/1338471056525291527/bw-yNZ8K_normal.jpg',
      //     created_at: '2020-12-07T17:42:23.000Z',
      //     username: 'newclientbeta',
      //     verified: false,
      //     public_metrics: {
      //       followers_count: 0,
      //       following_count: 3,
      //       tweet_count: 10,
      //       listed_count: 0,
      //     },
      //     url: 'https://twitter.com/newclientbeta',
      //   },
      //   tweets: [
      //     { id: '1550671862006308865', text: 'test https://t.co/AhsbdZZxBI' },
      //     {
      //       id: '1549354768853712896',
      //       text: 'やったー！ https://t.co/0ntZM4HYLk',
      //     },
      //     {
      //       id: '1549054045645848576',
      //       text: 'test4 https://t.co/0kmjIqqMFX',
      //     },
      //     {
      //       id: '1549053830100238338',
      //       text: 'test2 https://t.co/vcckAA8cd6',
      //     },
      //     {
      //       id: '1549053737171558401',
      //       text: 'test2 https://t.co/SsPUTCaGLt https://t.co/SsPUTCaGLt https://t.co/SsPUTCaGLt',
      //     },
      //     { id: '1549053361084805120', text: 'https://t.co/eyuT9JLxbp' },
      //     { id: '1549049398973255680', text: 'test https://t.co/nsNw1yGAeF' },
      //     {
      //       id: '1549048497424449537',
      //       text: 'just setting up my #TwitterAPI',
      //     },
      //     { id: '1548867874588336129', text: 'aaaaaaaa' },
      //     { id: '1548862943818788864', text: 'tweet test' },
      //   ],
      // };
      const res = await api.getTwitterProfile(userId);
      if (res) {
        let { tweets, twitter, ...data } = res;
        setApplier({ ...data, twitter });
        if (typeof tweets !== 'undefined') {
          setTweets(tweets);
        }
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
    setUi({ isLoading: false });
    router.push(`/form/${listId}`);
  };

  const handleClickDeny = async () => {
    setUi({ isLoading: true });
    await api.denyApply({ listId, applierId: userId });
    setUi({ isLoading: false });
    router.push(`/form/${listId}`);
  };

  return (
    <>
      {typeof applier !== 'undefined' ? (
        <div className={styles['container']}>
          <div className={styles['twitter-profile-container']}>
            <div>
              <div className={styles['twitter-user-name']}>
                <UserProfile
                  href={applier?.twitter?.url ?? ''}
                  profileImageUrl={applier?.twitter?.profile_image_url ?? ''}
                  name={applier?.twitter?.name ?? ''}
                  username={applier?.twitter?.username ?? ''}
                />
                <Text size="sm">
                  {t('joined')}
                  {applier?.twitter?.created_at
                    ? new Date(
                        applier?.twitter?.created_at
                      ).toLocaleDateString()
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
                AIの判定
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
              <Timeline
                dataSource={{
                  sourceType: 'profile',
                  screenName: applier.twitter?.username,
                }}
              />
            </div>
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
            <Button size="xm" icon={<DoNotDisturb />} onClick={handleClickDeny}>
              {t('deny')}
            </Button>
          </div>
        </div>
      ) : null}
      <Modal
        opened={opened}
        onClose={() => setOpened(false)}
        title="Introduce yourself!"
        fullScreen
        transition="slide-up"
        trapFocus
      >
        <div>
          {t('whoAllowThisUser')}
          {allowedHistory.map((h) => (
            <div key={h.doc_id}>
              <img src={h.data.twitter.profile_image_url} alt="profile_image" />
              {h.data.twitter.name}
              {h.data.twitter.username}
            </div>
          ))}
        </div>
        <div>
          {t('whoDenyThisUser')}
          {deniedHistory.map((h) => (
            <div key={h.doc_id}>
              <img src={h.data.twitter.profile_image_url} alt="profile_image" />
              {h.data.twitter.name}
              {h.data.twitter.username}
            </div>
          ))}
        </div>
      </Modal>
    </>
  );
}
