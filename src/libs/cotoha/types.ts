// see more info:https://api.ce-cotoha.com/contents/reference/apireference.html

type CotohaGetAccessTokenApiResponse = {
  access_token: string;
  token_type: string;
  expires_in: string;
  scope: string;
  issued_at: string;
};

type CotohaGetUserAttributeEstimateApiResponse = {
  result: {
    age: string;
  };
  status: number;
  message: string;
};

export type {
  CotohaGetAccessTokenApiResponse,
  CotohaGetUserAttributeEstimateApiResponse,
};
