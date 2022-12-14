import { Menu, Menu as MTMenu, Modal } from '@mantine/core';
import clsx from 'clsx';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import { useRecoilValue, useSetRecoilState } from 'recoil';

import type { SessionState } from '@/store';

import {
  BackButton,
  MenuIcon,
  UrlCopy,
  Header,
  LoadingOverLay,
  Footer,
} from '@/components';
import { sessionState, uiState } from '@/store';
import styles from '@/styles/components/layout.module.scss';

type LayoutProps = {
  session: SessionState;
  children: React.ReactNode;
};

export default function Layout({ session, children }: LayoutProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const { listId } = router.query as { listId: string };
  const setSession = useSetRecoilState<SessionState>(sessionState);
  const ui = useRecoilValue(uiState);
  const [openedCopyModal, setOpenedCopyModal] = useState<boolean>(false);
  useEffect(() => {
    setSession(session);
  }, [session]);
  return (
    <>
      <Header />
      {ui.isLoading ? <LoadingOverLay /> : null}
      <main
        className={clsx(styles.main, {
          [styles['main-with-footer']]: router.pathname === '/',
          [styles['main-with-twitter-timeline']]:
            router.pathname === '/form/[listId]/[userId]',
        })}
      >
        {router.pathname !== '/' &&
        router.pathname !== '/mypage' &&
        router.pathname !== '/form/[listId]/apply' &&
        router.pathname !== '/404' &&
        router.pathname !== '/500' &&
        router.pathname !== '/429' ? (
          <div className={styles['sub-header']}>
            <BackButton />
            {router.pathname === '/form/[listId]' ? (
              <>
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
              </>
            ) : null}
          </div>
        ) : null}
        <div className={styles['main-container']}>{children}</div>
      </main>
      {router.pathname === '/' ? <Footer /> : null}
    </>
  );
}
