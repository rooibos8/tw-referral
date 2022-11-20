import '@/styles/globals.scss';

import { RecoilRoot } from 'recoil';

import type { AppProps } from 'next/app';

import Layout from '@/components/Layout';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <RecoilRoot>
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </RecoilRoot>
  );
}
