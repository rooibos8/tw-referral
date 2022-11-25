import { atom } from 'recoil';

import { Form } from '@/constants';
import { UserInfo } from '@/libs/firebase';

export type FormState = {
  data: Array<
    Form & { appliers?: Array<UserInfo & { allowed: number; denied: number }> }
  >;
};

const FORM_DEFAULT_STATE = {
  data: [],
};

const formState = atom<FormState>({
  key: 'form',
  default: FORM_DEFAULT_STATE,
});

export { formState };
