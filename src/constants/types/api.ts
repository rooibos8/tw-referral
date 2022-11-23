import type { ListFormStatus, ApplyStatus } from '@/constants';

import type {
  JudgeHistoryDoc,
  TwitterUserInfo,
  UserDoc,
  UserInfo,
} from '@/libs/firebase';

import { TwitterProfile } from '@/libs/twitter';

export type Form = {
  id?: string;
  name: string;
  status?: ListFormStatus;
  twitter: {
    id: string;
    name: string;
  };
  appliers: Array<{
    doc_id: string;
    twitter: TwitterUserInfo;
  }>;
};

export type GetFormApiResponse = {
  data: Array<Form>;
};

export type GetAppliersApiResponse = {
  data: Array<{
    user: { doc_id: string } & UserInfo;
    status: ApplyStatus;
  }>;
};

export type GetTwitterProfileApiResponse = UserDoc & {
  twitter: TwitterProfile;
};

export type GetJudgeHistoryApiResponse = {
  data: {
    allowed: Array<JudgeHistoryDoc>;
    denied: Array<JudgeHistoryDoc>;
  };
};

export type PostApplyApiResponse = TwitterUserInfo;
