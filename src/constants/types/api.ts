import type { ListFormStatus, ApplyStatus } from '@/constants';

import type {
  JudgeHistoryDoc,
  ListFormDoc,
  TwitterUserInfo,
  UserDoc,
  UserInfo,
} from '@/libs/firebase';

import { Tweet, TwitterProfile } from '@/libs/twitter';

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
  tweets?: Array<Tweet>;
  twitter?: TwitterProfile;
};

export type GetJudgeHistoryApiResponse = {
  data: {
    allowed: Array<JudgeHistoryDoc>;
    denied: Array<JudgeHistoryDoc>;
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

export type PostApplyApiResponse = TwitterUserInfo;
