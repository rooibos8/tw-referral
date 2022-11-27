const path = require('path');
module.exports = {
  i18n: {
    defaultLocale: 'jp',
    locales: ['jp', 'kr', 'en'],
    localePath: path.resolve('./src/locales'),
  },
};
