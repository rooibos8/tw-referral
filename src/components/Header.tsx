import { useRouter } from 'next/router';
import React from 'react';

const Header = () => {
  const router = useRouter();

  const handleClickSignOut = async () => {
    await fetch('/api/auth/me', {
      method: 'DELETE',
    });
    router.push('/');
  };

  return (
    <header>
      <p></p>tw-referral
      <button onClick={handleClickSignOut}>サインアウト</button>
    </header>
  );
};

export { Header };
