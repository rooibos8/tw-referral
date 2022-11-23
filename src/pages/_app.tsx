import '@/styles/globals.scss';
import 'react-loading-skeleton/dist/skeleton.css';
import '/node_modules/flag-icons/css/flag-icons.min.css';
import '/node_modules/spinkit/spinkit.min.css';
import { appWithTranslation } from 'next-i18next';
import { RecoilRoot } from 'recoil';

import type { AppProps } from 'next/app';

import { ErrorBoundary } from '@/components';
import Layout from '@/components/Layout';

export default appWithTranslation(function App({
  Component,
  pageProps,
}: AppProps) {
  console.log('MyApp!!!', pageProps);
  return (
    <ErrorBoundary>
      <RecoilRoot>
        <Layout session={pageProps.session}>
          <Component {...pageProps} />
        </Layout>
      </RecoilRoot>
    </ErrorBoundary>
  );
});
