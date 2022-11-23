import { Menu } from '@mantine/core';
import Image from 'next/image';
import { useRouter } from 'next/router';
import React from 'react';

import { useRecoilValue } from 'recoil';

import styles from './style.module.scss';

import { FlagIcon, UserIcon, Title } from '@/components';
import { sessionState } from '@/store';

const Header = () => {
  const router = useRouter();
  const { locale } = router;
  const session = useRecoilValue(sessionState);

  console.log('Header!!!!');
  console.log(session);
  console.log(router.pathname);
  const handleClickSignOut = async () => {
    await fetch('/api/auth/me', {
      method: 'DELETE',
    });
    router.push('/');
  };

  const handleClickGoToTop = async () => {
    if (!session || !session.loggedIn) {
      await fetch('/api/auth/me', {
        method: 'DELETE',
      });
    }
    router.push('/');
  };

  const handleClickLocale = (newLocale: string) => {
    const pathname = location.pathname.replace(/^\/(en|kr|jp)/, '');
    router.push(
      `${process.env.NEXT_PUBLIC_BASE_URL}${pathname}${location.search}`,
      router.asPath,
      {
        locale: newLocale,
      }
    );
  };

  return (
    <header className={styles.header}>
      <div>
        {session?.loggedIn ? (
          <Menu position="bottom-start" withArrow>
            <Menu.Target>
              <div>
                <UserIcon src={session.twitter.profile.profileImageUrl ?? ''} />
              </div>
            </Menu.Target>
            <Menu.Dropdown>
              <Menu.Item onClick={handleClickSignOut}>サインアウト</Menu.Item>
            </Menu.Dropdown>
          </Menu>
        ) : null}
      </div>
      <div onClick={handleClickGoToTop} className={styles.title}>
        <Title>tw-referral</Title>
      </div>
      <div>
        <Menu position="bottom-end" withArrow>
          <Menu.Target>
            <div className={styles.flag}>
              <FlagIcon locale={locale} />
            </div>
          </Menu.Target>
          <Menu.Dropdown>
            <Menu.Item onClick={() => handleClickLocale('jp')}>
              <FlagIcon locale="jp" />
            </Menu.Item>
            <Menu.Item onClick={() => handleClickLocale('kr')}>
              <FlagIcon locale="kr" />
            </Menu.Item>
            <Menu.Item onClick={() => handleClickLocale('en')}>
              <FlagIcon locale="en" />
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>
      </div>
    </header>
  );
};

export { Header };
