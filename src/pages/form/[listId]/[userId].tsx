import { Modal } from '@mantine/core';
import { InferGetServerSidePropsType } from 'next';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';

import { Button, BackButton } from '@/components';
import { GetTwitterProfileApiResponse } from '@/constants';
import * as api from '@/libs/api';
import { JudgeHistoryDoc, UserDoc, UserInfo } from '@/libs/firebase';
import { withSessionSsr } from '@/libs/session/client';
import { TwitterProfile } from '@/libs/twitter';

export const getServerSideProps = withSessionSsr();

export default function New() {
  const router = useRouter();
  const { userId, listId } = router.query as { userId: string; listId: string };
  const [opened, setOpened] = useState<boolean>(false);
  const [selected, setSelected] = useState<GetTwitterProfileApiResponse>();
  const [applier, setApplier] = useState<
    UserDoc & { twitter: TwitterProfile }
  >();
  const [tweets, setTweets] = useState<Array<{ text: string; id: string }>>([]);
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
      const data = await api.getTwitterProfile(userId);
      if (data) {
        setApplier(data);
      }
    })();

    (async () => {
      const res = await api.getJudgeHistory(userId);
      if (!res) return;
      const { data } = res;
      setAllowedHistory(data.allowed);
      setDeniedHistory(data.denied);
      setJudge({
        allowed:
          data.allowed.length / (data.allowed.length + data.denied.length),
        denied: data.denied.length / (data.allowed.length + data.denied.length),
      });
    })();
  }, [userId]);

  const handleClickShowHistory = () => {
    setOpened(true);
  };

  const handleClickAllow = async () => {
    await api.allowApply({ listId, applierId: userId });
    router.push(`/form/${listId}`);
  };

  const handleClickDeny = async () => {
    await api.denyApply({ listId, applierId: userId });
    router.push(`/form/${listId}`);
  };

  return (
    <div>
      <BackButton href="/mypage">戻る</BackButton>
      {typeof applier !== 'undefined' ? (
        <>
          <img src={applier?.twitter.profile_image_url} alt="profile_image" />
          {applier.twitter.name}
          {applier.twitter.username}
          {applier.data.ai_guessed_age_gt !== null &&
          applier.data.ai_guessed_age_gt > 19 ? (
            <>19+</>
          ) : null}
        </>
      ) : null}
      <div onClick={handleClickShowHistory}>twitterの他のユーザーの判定</div>
      <div>
        {/* <a
          className="twitter-timeline"
          href="https://twitter.com/aikawa__k?ref_src=twsrc%5Etfw"
        >
          Tweets by aikawa__k
        </a>{' '}
        <script
          async
          src="https://platform.twitter.com/widgets.js"
          charset="utf-8"
        ></script> */}
      </div>
      <div>
        <Button onClick={handleClickAllow}>許可</Button>
        <Button onClick={handleClickDeny}>却下</Button>
      </div>
      <Modal
        opened={opened}
        onClose={() => setOpened(false)}
        title="Introduce yourself!"
        fullScreen
        transition="slide-up"
        trapFocus
      >
        <div>
          以下のユーザーは許可しました
          {allowedHistory.map((h) => (
            <div key={h.doc_id}>
              <img src={h.data.twitter.profile_image_url} alt="profile_image" />
              {h.data.twitter.name}
              {h.data.twitter.username}
            </div>
          ))}
        </div>
        <div>
          以下のユーザーは却下しました
          {deniedHistory.map((h) => (
            <div key={h.doc_id}>
              <img src={h.data.twitter.profile_image_url} alt="profile_image" />
              {h.data.twitter.name}
              {h.data.twitter.username}
            </div>
          ))}
        </div>
      </Modal>
    </div>
  );
}
