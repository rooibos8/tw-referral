type TwitterUser = {
  id: string;
  name: string;
  username: string;
  profile_image_url: string;
};

type TwitterLists = Array<{
  id: string;
  name: string;
}>;

type TwitterGetAccessTokenRequestParams = {
  code?: string;
  grant_type: 'authorization_code' | 'refresh_token';
  client_id: string;
  redirect_uri?: string;
  code_verifier?: string;
  refresh_token?: string;
};

type TwitterGetOwnedApiResponse = {
  data: Array<{
    id: string;
    name: string;
  }>;
};

type TwitterGetMeApiResponse = {
  data: TwitterUser;
};

type TwitterGetAccessTokenApiResponse = {
  token_type: 'bearer';
  expires_in: number;
  access_token: string;
  scope: string;
};

type TwitterGetTweetsApiResponse = {
  data: Array<{
    id: string;
    edit_history_tweet_ids: Array<string>;
    text: string;
  }>;
};

export type {
  TwitterGetMeApiResponse,
  TwitterGetOwnedApiResponse,
  TwitterGetAccessTokenApiResponse,
  TwitterGetTweetsApiResponse,
  TwitterUser,
  TwitterLists,
  TwitterGetAccessTokenRequestParams,
};
