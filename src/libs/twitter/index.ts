import axios from 'axios';
import * as CryptoJS from 'crypto-js';

import type {
  TwitterUser,
  TwitterLists,
  TwitterGetAccessTokenRequestParams,
  TwitterGetOwnedApiResponse,
  TwitterGetMeApiResponse,
  TwitterGetAccessTokenApiResponse,
  TwitterGetTweetsApiResponse,
} from './types';

const STATE = process.env.TWITTER_CLIENT_ID as string;

const getAccessToken = async ({
  code,
  state,
  token,
}: {
  code?: string;
  state?: string;
  token?: string;
}): Promise<{
  access_token: string;
  expires_at: Date;
}> => {
  let params: TwitterGetAccessTokenRequestParams = {
    grant_type: 'authorization_code',
    client_id: process.env.TWITTER_CLIENT_ID as string,
  };

  if (token) {
    params = {
      ...params,
      grant_type: 'refresh_token',
      refresh_token: token,
    };
  } else {
    if (state !== STATE) {
      throw "State isn't matching";
    }

    params = {
      ...params,
      grant_type: 'authorization_code',
      code,
      redirect_uri: `${process.env.PUBLIC_BASE_URL}/mypage`,
      code_verifier: process.env.TWITTER_CLIENT_ID,
    };
  }

  const {
    data: { access_token, expires_in },
  } = await axios.post<TwitterGetAccessTokenApiResponse>(
    `${process.env.TWITTER_API_V2_URL}/oauth2/token`,
    {},
    {
      params,
      headers: {
        ['Content-Type']: 'application/x-www-form-urlencoded',
      },
      auth: {
        username: process.env.TWITTER_CLIENT_ID as string,
        password: process.env.TWITTER_CLIENT_SECRET as string,
      },
    }
  );
  return { access_token, expires_at: new Date(Date.now() + expires_in) };
};

const generateAuthLinkV2 = ({
  redirectUrl,
  scopes,
}: {
  redirectUrl: string;
  scopes: Array<string>;
}): string => {
  const hash = CryptoJS.SHA256(process.env.TWITTER_CLIENT_ID as string);
  return `https://twitter.com/i/oauth2/authorize?response_type=code&client_id=${
    process.env.TWITTER_CLIENT_ID
  }&redirect_uri=${encodeURIComponent(redirectUrl)}&scope=${scopes.join(
    encodeURIComponent(' ')
  )}&state=${encodeURIComponent(STATE)}&code_challenge=${hash
    .toString(CryptoJS.enc.Base64)
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')}&code_challenge_method=S256`;
};

const findMe = async (token: string): Promise<TwitterUser> => {
  const {
    data: { data },
  } = await axios.get<TwitterGetMeApiResponse>(
    `${process.env.TWITTER_API_V2_URL}/users/me`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: {
        'user.fields': 'id,name,username,profile_image_url',
      },
    }
  );
  return data;
};

const findOwnedList = async (
  token: string,
  twitter_id: string
): Promise<
  Array<{
    id: string;
    name: string;
  }>
> => {
  const {
    data: { data },
  } = await axios.get<TwitterGetOwnedApiResponse>(
    `${process.env.TWITTER_API_V2_URL}/users/${twitter_id}/owned_lists`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: {
        'list.fields': 'member_count',
      },
    }
  );
  return data ?? [];
};

const findTweets = async (
  token: string,
  twitter_id: string
): Promise<Array<string>> => {
  const {
    data: { data },
  } = await axios.get<TwitterGetTweetsApiResponse>(
    `${process.env.TWITTER_API_V2_URL}/users/${twitter_id}/tweets`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: {
        max_results: 100,
      },
    }
  );
  return data.map((d) => d.text);
};

export {
  generateAuthLinkV2,
  getAccessToken,
  findMe,
  findOwnedList,
  findTweets,
};

export * from './types';
