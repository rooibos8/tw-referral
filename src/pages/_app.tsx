import '@/styles/globals.scss';

import { RecoilRoot } from 'recoil';

import type { AppProps } from 'next/app';

import { ErrorBoundary } from '@/components';

import Layout from '@/components/Layout';

export default function App({
  Component,
  pageProps: { session, ...pageProps },
}: AppProps) {
  return (
    <ErrorBoundary>
      <RecoilRoot>
        <Layout>
          <Component {...pageProps} />
        </Layout>
      </RecoilRoot>
    </ErrorBoundary>
  );
}
