export type TwitterUser = {
  id: string;
  name: string;
  username: string;
  profile_image_url: string;
};

export type TwitterLists = Array<{
  id: string;
  name: string;
}>;

export type TwitterListMembers = Array<TwitterUser>;

export type TwitterGetAccessTokenRequestParams = {
  code?: string;
  grant_type: 'authorization_code' | 'refresh_token';
  client_id: string;
  redirect_uri?: string;
  code_verifier?: string;
  refresh_token?: string;
};

export type TwitterGetOwnedApiResponse = {
  data: Array<{
    id: string;
    name: string;
  }>;
};

export type TwitterGetMeApiResponse = {
  data: {
    id: string;
    name: string;
    username: string;
    profile_image_url: string;
  };
};

export type TwitterGetAccessTokenApiResponse = {
  token_type: 'bearer';
  expires_in: number;
  access_token: string;
  scope: string;
  refresh_token: string;
};

export type TwitterGetTweetsApiResponse = {
  data: Array<Tweet>;
};

export type Tweet = {
  id: string;
  text: string;
};

export type TwitterProfile = {
  id: string;
  public_metrics: {
    followers_count: number;
    following_count: number;
    tweet_count: number;
    listed_count: number;
  };
  url: string;
  description: string;
  verified: boolean;
  protected: boolean;
  created_at: string;
  username: string;
  name: string;
  profile_image_url: string;
};

export type TwitterGetUserApiResponse = {
  data: TwitterProfile;
};

export type TwitterGetListMembersApiResponse = {
  data: Array<TwitterUser>;
  meta: {
    result_count: number;
    next_token: string;
  };
};

export type TwitterPutListMemberApiResponse = {
  data: {
    is_member: boolean;
  };
};

export type TwitterGetListByIdApiResponse = {
  data: {
    id: string;
    name: string;
    member_count: number;
  };
};
