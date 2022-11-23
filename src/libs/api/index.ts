import {
  APPLY_STATUS,
  GetAppliersApiResponse,
  GetFormApiResponse,
  GetJudgeHistoryApiResponse,
  GetTwitterListApiResponse,
  GetTwitterProfileApiResponse,
} from '@/constants';

const _fetch = async <T>(
  url: string,
  options?: RequestInit
): Promise<T | void> => {
  try {
    const res = await fetch(url, options);

    if (res.status === 401) {
      await fetch('/api/auth/me', {
        method: 'DELETE',
      });
      if (location) {
        location.href = '/';
      }
    }

    const data = await res.json();
    if (!res.ok) {
      console.error(data);
      throw new Error('something wrong.');
    }

    return data;
  } catch (err) {
    console.error(err);
  }
};

export const getForms = async (): Promise<GetFormApiResponse | void> => {
  return await _fetch<GetFormApiResponse>('/api/form');
};

export const openForm = async ({
  twListId,
  importExistsAccount,
}: {
  twListId: string;
  importExistsAccount: boolean;
}): Promise<{ newId: string } | void> => {
  return await _fetch('/api/form', {
    method: 'POST',
    body: JSON.stringify({
      twListId,
      importExistsAccount,
    }),
  });
};

export const getTwitterProfile = async (
  userId: string
): Promise<GetTwitterProfileApiResponse | void> => {
  return await _fetch<GetTwitterProfileApiResponse>(
    `/api/twitter/users/${userId}`
  );
};

export const getJudgeHistory = async (
  userId: string
): Promise<GetJudgeHistoryApiResponse | void> => {
  return await _fetch<GetJudgeHistoryApiResponse>(`/api/history/${userId}`);
};

export const allowApply = async ({
  listId,
  applierId,
}: {
  listId: string;
  applierId: string;
}) => {
  return await _fetch('/api/form/apply', {
    method: 'PUT',
    body: JSON.stringify({
      listId,
      applierId,
      status: APPLY_STATUS.ALLOW,
    }),
  });
};

export const denyApply = async ({
  listId,
  applierId,
}: {
  listId: string;
  applierId: string;
}) => {
  return await _fetch('/api/form/apply', {
    method: 'PUT',
    body: JSON.stringify({
      listId,
      applierId,
      status: APPLY_STATUS.DENY,
    }),
  });
};

export const getAuthLink = async (
  returnUrl: string
): Promise<{ authUrl: string } | void> => {
  return await _fetch<{ authUrl: string }>(
    `/api/auth/me?returnUrl=${encodeURIComponent(returnUrl)}`
  );
};

export const getAppliers = async (
  listId: string
): Promise<GetAppliersApiResponse | void> => {
  return await _fetch<GetAppliersApiResponse>(
    `/api/form/appliers?id=${listId}`
  );
};

export const getTwitterList = async (
  twListId: string
): Promise<GetTwitterListApiResponse | void> => {
  return await _fetch<GetTwitterListApiResponse>(
    `/api/twitter/lists/${twListId}`
  );
};
