import { Menu, Menu as MTMenu } from '@mantine/core';
import { Modal } from '@mantine/core';
import { useTranslation } from 'next-i18next';
import Link from 'next/link';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';

import { BackButton, MenuIcon, UrlCopy } from '@/components';
import { APPLY_STATUS } from '@/constants';
import * as api from '@/libs/api';
import { UserInfo } from '@/libs/firebase';
import { withSessionSsr } from '@/libs/session/client';

import styles from '@/styles/pages/form/[listId]/index.module.scss';
export const getServerSideProps = withSessionSsr();

export default function Appliers() {
  const { t } = useTranslation();
  const router = useRouter();
  const { listId } = router.query as { listId: string };
  const [appliers, setAppliers] = useState<Array<UserInfo>>([]);
  const [openedCopyModal, setOpenedCopyModal] = useState<boolean>(false);
  useEffect(() => {
    if (!listId) return;
    (async () => {
      const res = await api.getAppliers(listId);
      if (res) {
        const { data } = res;
        setAppliers(
          data.filter((d) => d.status === APPLY_STATUS.STAY).map((d) => d.user)
        );
      }
    })();
  }, [listId]);

  return (
    <div>
      <div className={styles['sub-header']}>
        <BackButton href="/mypage">{t('back')}</BackButton>
        <MTMenu position="bottom-end" withArrow>
          <Menu.Target>
            <div>
              <MenuIcon />
            </div>
          </Menu.Target>
          <Menu.Dropdown>
            <Menu.Item onClick={() => setOpenedCopyModal(true)}>
              {t('doCopyUrl')}
            </Menu.Item>
          </Menu.Dropdown>
        </MTMenu>
      </div>
      <Modal
        opened={openedCopyModal}
        onClose={() => setOpenedCopyModal(false)}
        fullScreen
        transition="slide-up"
        trapFocus
        classNames={{
          modal: styles['modal'],
          close: styles['modal-close'],
        }}
      >
        <UrlCopy
          url={`${process.env.NEXT_PUBLIC_BASE_URL}/form/${listId}/apply`}
        />
      </Modal>

      {appliers.length > 0 ? (
        <>
          {appliers.map((applier, i) => (
            <Link
              key={i}
              href={`${process.env.NEXT_PUBLIC_BASE_URL}/form/${listId}/${applier.doc_id}`}
            >
              <img
                src={applier.twitter.profile_image_url}
                alt="profile_image"
              />
              {applier.twitter.name}
              {applier.twitter.username}
              {applier.ai_guessed_age_gt !== null &&
              applier.ai_guessed_age_gt > 19 ? (
                <>19+</>
              ) : null}
            </Link>
          ))}
        </>
      ) : (
        <h3>おめでとうございます！</h3>
      )}
    </div>
  );
}
