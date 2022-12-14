import { captureMessage } from '@sentry/nextjs';
import * as CryptoJS from 'crypto-js';

import type {
  TwitterUser,
  TwitterLists,
  TwitterGetMeApiResponse,
  TwitterGetAccessTokenApiResponse,
  TwitterGetTweetsApiResponse,
  TwitterGetListMembersApiResponse,
  TwitterGetListByIdApiResponse,
  TwitterListMembers,
  TwitterGetUserApiResponse,
  TwitterPutListMemberApiResponse,
  TwitterGetOwnedApiResponse,
  TwitterProfile,
  Tweet,
} from './types';
import type { FetchParams } from '@/libs';
import type { NextApiRequest } from 'next';

const STATE = process.env.TWITTER_CLIENT_ID as string;
const SCOPES = [
  'users.read',
  'list.read',
  'list.write',
  'list.read',
  'tweet.read',
  'offline.access',
];
const PARAMS_USER_FIELDS = {
  'user.fields': 'id,name,username,profile_image_url',
};

const _get = async <R>(
  token: string,
  url: string,
  params?: FetchParams,
  retry?: boolean
): Promise<R | undefined> => {
  try {
    const fullUrl = `${process.env.TWITTER_API_V2_URL}${url}${
      typeof params !== 'undefined' ? `?${new URLSearchParams(params)}` : ''
    }`;
    const res = await fetch(fullUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data: R = await res.json();
    if (!res.ok) {
      throw new Error('GET Twitter API response error', {
        cause: {
          res,
          data,
        },
      });
    }
    return data;
  } catch (err) {
    if (process.env.NODE_ENV !== 'production') {
      console.log('!!!!!twitter api !!!!!');
      console.log(err);
    }
    const _e = err as { code: string };
    if (_e?.code === 'ETIMEDOUT' && !retry) {
      return await _get(token, url, params, true);
    }
    throw err;
  }
};

const _post = async <R>(
  token: string,
  url: string,
  {
    params,
    body,
    headers,
  }: {
    params?: FetchParams;
    body?: Record<string, string | number>;
    headers?: HeadersInit;
  },
  retry?: boolean
): Promise<R> => {
  const fullUrl = `${process.env.TWITTER_API_V2_URL}${url}${
    typeof params !== 'undefined' ? `?${new URLSearchParams(params)}` : ''
  }`;
  try {
    const res = await fetch(fullUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        ['Content-Type']: 'application/json',
        ...headers,
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
    });
    const data: R = await res.json();
    if (!res.ok) {
      throw new Error('POST Twitter API response error', {
        cause: { res, data },
      });
    }
    return data;
  } catch (err) {
    const _e = err as { code: string };
    if (_e?.code === 'ETIMEDOUT' && !retry) {
      captureMessage(`Retry calling api ${fullUrl} due to ETIMEDOUT`, {
        level: 'info',
      });
      return await _post(token, url, { params, body, headers }, true);
    }
    throw err;
  }
};

export const getAccessToken = async (
  req: NextApiRequest,
  save: boolean = true
): Promise<{
  token: string;
  expiresAt: Date;
  refreshToken: string;
  profile: TwitterUser;
}> => {
  const { code, state } = req.query as { code: string; state: string };
  let { refreshToken, profile } = req.session.twitter ?? {};

  if (
    typeof refreshToken === 'undefined' &&
    typeof code === 'undefined' &&
    typeof state === 'undefined'
  ) {
    throw {
      status: 400,
      statusText: 'invalid token',
    };
  }

  const data = await _post<TwitterGetAccessTokenApiResponse>(
    '',
    '/oauth2/token',
    {
      params: {
        client_id: process.env.TWITTER_CLIENT_ID as string,
        ...(code && state
          ? {
              // create new access token
              code: code as string,
              grant_type: 'authorization_code',
              redirect_uri:
                `${process.env.NEXT_PUBLIC_BASE_URL}/login` as string,
              code_verifier: process.env.TWITTER_CLIENT_ID as string,
            }
          : {
              // refresh token
              grant_type: 'refresh_token',
              refresh_token: refreshToken,
            }),
      },
      headers: {
        ['Content-Type']: 'application/x-www-form-urlencoded',
        Authorization: `Basic ${CryptoJS.enc.Utf8.parse(
          `${process.env.TWITTER_CLIENT_ID}:${process.env.TWITTER_CLIENT_SECRET}`
        ).toString(CryptoJS.enc.Base64)}`,
      },
    }
  );

  const {
    access_token: accessToken,
    expires_in: expiresIn,
    refresh_token: refreshTokenNew,
  }: TwitterGetAccessTokenApiResponse = data;

  if (process.env.NODE_ENV !== 'production') {
    if (refreshToken) {
      console.log('result of refresh token');
    } else {
      console.log('result of create new  token');
    }
    console.log('access_token   :' + accessToken);
    console.log('expires_in     :' + expiresIn);
    console.log('refresh_token  :' + refreshTokenNew);
  }

  req.session.twitter = {
    ...req.session.twitter,
    token: accessToken,
    expiresAt: new Date(Date.now() + expiresIn * 1000),
    refreshToken: refreshTokenNew ?? refreshToken,
  };
  if (typeof profile === 'undefined') {
    const me = await findMe(accessToken);
    if (typeof me !== 'undefined') {
      req.session.twitter.profile = me;
    }
  }

  if (save) {
    await req.session.save();
  }
  return req.session.twitter;
};

export const generateAuthLinkV2 = ({
  redirectUrl,
}: {
  redirectUrl: string;
}): string => {
  const hash = CryptoJS.SHA256(process.env.TWITTER_CLIENT_ID as string);
  return `https://twitter.com/i/oauth2/authorize?response_type=code&client_id=${
    process.env.TWITTER_CLIENT_ID
  }&redirect_uri=${encodeURIComponent(redirectUrl)}&scope=${SCOPES.join(
    encodeURIComponent(' ')
  )}&state=${encodeURIComponent(STATE)}&code_challenge=${hash
    .toString(CryptoJS.enc.Base64)
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')}&code_challenge_method=S256`;
};

export const findMe = async (
  token: string
): Promise<TwitterUser | undefined> => {
  const res = await _get<TwitterGetMeApiResponse>(
    token,
    '/users/me',
    PARAMS_USER_FIELDS
  );
  return res?.data;
};

export const findOwnedList = async (
  token: string,
  tw_id: string
): Promise<TwitterLists | undefined> => {
  const res = await _get<TwitterGetOwnedApiResponse>(
    token,
    `/users/${tw_id}/owned_lists`,
    {
      'list.fields': 'member_count',
    }
  );
  return res?.data;
};

export const findTweets = async (
  token: string,
  tw_user_id: string
): Promise<Array<Tweet> | undefined> => {
  const res = await _get<TwitterGetTweetsApiResponse>(
    token,
    `/users/${tw_user_id}/tweets`,
    {
      max_results: '100',
    }
  );
  return typeof res === 'undefined'
    ? undefined
    : res.data.map(({ id, text }) => ({ id, text }));
};

export const findListById = async (
  token: string,
  twitterListId: string
): Promise<
  | {
      id: string;
      name: string;
      member_count: number;
    }
  | undefined
> => {
  const res = await _get<TwitterGetListByIdApiResponse>(
    token,
    `/lists/${twitterListId}`,
    {
      'list.fields': 'member_count',
    }
  );
  return res?.data;
};

export const findListMembers = async (
  token: string,
  twitterListId: string,
  filterTwitterIds: Array<string>
): Promise<TwitterListMembers> => {
  let members: TwitterListMembers = [];
  let nextPageToken = '';
  do {
    const res = await _get<TwitterGetListMembersApiResponse>(
      token,
      `/lists/${twitterListId}/members`,
      {
        max_results: '100',
        ...PARAMS_USER_FIELDS,
        ...(nextPageToken !== '' && typeof nextPageToken !== 'undefined'
          ? { pagination_token: nextPageToken }
          : {}),
      }
    );
    if (typeof res !== 'undefined') {
      const { data, meta } = res;
      if (filterTwitterIds.length > 0) {
        const { data } = res;
        members = [
          ...members,
          ...(Array.isArray(data)
            ? data.filter((d) => filterTwitterIds.includes(d.id))
            : []),
        ];
      } else {
        members = [...members, ...data];
      }
      nextPageToken = meta.next_token;
    } else {
      // ??????????????????????????????????????????????????????????????????
      nextPageToken = '';
    }
  } while (
    // ?????????????????????????????????????????????????????????????????????????????????
    nextPageToken !== '' &&
    typeof nextPageToken !== 'undefined' &&
    filterTwitterIds.length > 0 &&
    filterTwitterIds.length !== members.length
  );
  return members;
};

export const addListMember = async (
  token: string,
  twListId: string,
  twUserId: string
): Promise<boolean> => {
  const {
    data: { is_member },
  } = await _post<TwitterPutListMemberApiResponse>(
    token,
    `/lists/${twListId}/members`,
    {
      body: {
        user_id: twUserId,
      },
    }
  );
  return is_member;
};

export const findUser = async (
  token: string,
  tw_id: string
): Promise<TwitterProfile | undefined> => {
  const res = await _get<TwitterGetUserApiResponse>(token, `/users/${tw_id}`, {
    'user.fields':
      'created_at,description,id,name,profile_image_url,protected,public_metrics,username,verified',
  });
  return res?.data;
};

export * from './types';
