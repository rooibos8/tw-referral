import type { ListFormStatus, ApplyStatus } from '@/constants';
import type { Timestamp } from 'firebase/firestore/lite';

type BaseProperty = {
  created_at: Timestamp;
  updated_at: Timestamp;
};

export type TwitterUserInfo = {
  id: string;
  name: string;
  username: string;
  profile_image_url: string;
};

export type UserInfo = {
  doc_id: string;
  ai_guessed_age_gt: number | null;
  ai_guessed_age_ls: number | null;
  can_create_form: boolean;
  twitter: TwitterUserInfo;
};

export type UserDoc = {
  doc_id: string;
  twitter_id: string;
  data: Omit<UserInfo, 'doc_id'> & BaseProperty;
};

export type ListFormDoc = {
  doc_id: string;
  twitter_list_id: string;
  data: {
    user: {
      doc_id: string;
      twitter: TwitterUserInfo;
    };
    status: ListFormStatus;
    twitter: {
      list_id: string;
      list_name: string;
    };
  } & BaseProperty;
};

export type ListFormApplierDoc = {
  doc_id: string;
  user_doc_id: string;
  data: {
    user: UserInfo;
    status: ApplyStatus;
    owner: {
      user_doc_id: string;
      list_doc_id: string;
      twitter: TwitterUserInfo;
    };
  } & BaseProperty;
};

export type JudgeHistoryDoc = {
  doc_id: string;
  data: {
    twitter: TwitterUserInfo;
    judged_at: Timestamp;
  };
};

export type AppSettingsDoc = {
  cotoha: {
    access_token: string;
    expires_at: Timestamp;
  };
  creators: Array<string>;
};
