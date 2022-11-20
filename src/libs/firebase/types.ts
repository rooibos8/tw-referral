import type { Timestamp } from 'firebase/firestore/lite';

type UserDoc = {
  id?: string;
  tw_id: string;
  tw_name: string;
  tw_username: string;
  tw_profile_image_url: string;
  allowed: number;
  denied: number;
  ai_guessed_age_gt: number;
  ai_guessed_age_ls: number;
  language: string;
};

type FormsDoc = {
  id: string;
  user_id: string;
  tw_list_id: string;
  tw_list_name: string;
  // member_count: number;
  status: 1 | 2 | 3; // 1=受付中、2==停止中、3=終了
};

type ScoreHistoryDoc = {
  id: string;
  user_id: string;
  list_id: string;
  status: 1 | 2 | 3 | 4; // 1=待機、2=許可、3=却下、4=取り消し
};

type AppSettingsDoc = {
  cotoha_access_token: string;
  cotoha_expires_at: Timestamp;
};

export type { UserDoc, FormsDoc, ScoreHistoryDoc, AppSettingsDoc };
