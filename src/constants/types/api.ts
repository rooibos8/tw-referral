import type { ListFormStatus, ApplyStatus } from '@/constants';

import type {
  JudgeHistory,
  ListFormApplierDoc,
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
    user: { doc_id: string; allowed: number; denied: number } & UserInfo;
    status: ApplyStatus;
  }>;
};

export type GetTwitterProfileApiResponse = UserDoc & {
  twitter: TwitterProfile;
};

export type GetJudgeHistoryApiResponse = {
  data: {
    allowed: Array<JudgeHistory>;
    denied: Array<JudgeHistory>;
  };
};

export type GetTwitterListApiResponse = {
  id: string;
  name: string;
  member_count: number;
};

export type UpdateApplyApiResponse = {
  ok: boolean;
  text?: string;
};

export type GetApplyApiResponse = {
  data: Array<ListFormApplierDoc>;
};

export type PostApplyApiResponse = TwitterUserInfo;
