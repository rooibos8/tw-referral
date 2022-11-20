import { atom } from 'recoil';

const auth = atom({
  key: 'auth',
  default: {
    isFetching: false,
  },
});

export { auth };
