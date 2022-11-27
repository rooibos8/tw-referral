import axios from 'axios';

import { Timestamp } from 'firebase-admin/firestore';

import type {
  CotohaGetAccessTokenApiResponse,
  CotohaGetUserAttributeEstimateApiResponse,
} from './types';

import { getAppSetting, updateAppSetting } from '@/libs/firebase';

const getCotohaApiAccessToken = async (): Promise<string> => {
  const { data } = await axios.post<CotohaGetAccessTokenApiResponse>(
    'https://api.ce-cotoha.com/v1/oauth/accesstokens',
    {
      grantType: 'client_credentials',
      clientId: process.env.COTOHA_CLIENT_ID,
      clientSecret: process.env.COTOHA_CLIENT_SECRET,
    }
  );
  updateAppSetting({
    cotoha: {
      access_token: data.access_token,
      expires_at: Timestamp.fromDate(
        new Date(Date.now() + Number(data.expires_in) * 1000)
      ),
    },
  });
  return data.access_token;
};

const getAgeEstimate = async (
  text: Array<string>
): Promise<{ min: number; max: number }> => {
  if (text.length === 0) return { min: 0, max: 0 };

  const doc = await getAppSetting();
  let token = '';
  if (
    typeof doc === 'undefined' ||
    doc.cotoha.expires_at.toDate() < new Date()
  ) {
    token = await getCotohaApiAccessToken();
  } else {
    token = doc.cotoha.access_token;
  }
  const {
    data: { result },
  } = await axios.post<CotohaGetUserAttributeEstimateApiResponse>(
    `${process.env.COTOHA_API_BASE_URL}/nlp/beta/user_attribute`,
    {
      document: text,
      type: 'kuzure',
    },
    {
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
        Authorization: `Bearer ${token}`,
      },
    }
  );
  const [min, max] =
    typeof result.age !== 'undefined'
      ? result.age.replace('歳', '').split('-')
      : [null, null];

  return { min: Number(min), max: Number(max) };
};

export { getAgeEstimate };
export * from './types';
