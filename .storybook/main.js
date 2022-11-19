const path = require('path');
// const { mergeConfig } = require('vite');
module.exports = {
  stories: [
    '../stories/**/*.stories.mdx',
    '../stories/**/*.stories.@(js|jsx|ts|tsx)',
  ],
  addons: [
    '@storybook/preset-scss',
    '@storybook/addon-links',
    '@storybook/addon-essentials',
    '@storybook/addon-interactions',
  ],
  // framework: {
  //   name: '@storybook/nextjs',
  //   options: {},
  // },
  framework: {
    name: '@storybook/react-webpack5',
    options: {},
  },
  docs: {
    docsPage: true,
  },
  // typescript: {
  //   reactDocgen: false,
  // },
  webpackFinal: (config) => {
    console.log('!!!!!!!!webpackFinal!!!!!!!!!');
    config.module.rules.push({
      test: /\.scss$/,
      use: ['style-loader', 'css-loader', 'sass-loader'],
      include: path.resolve(__dirname, '../'),
    });
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.resolve(__dirname, '../src'),
    };
    console.log(JSON.stringify(config, null, 2));
    return config;
  },
  // viteのbuildがpnpm7系に対応してないので保留
  // https://github.com/storybookjs/builder-vite/issues/55#issuecomment-1273443058
  // core: {
  //   builder: '@storybook/builder-vite',
  // },
  // viteFinal: async (config) => {
  //   return mergeConfig(config, {
  //     resolve: {
  //       alias: {
  //         '@': path.resolve(__dirname, '../src'),
  //       },
  //     },
  //   });
  // },
};
