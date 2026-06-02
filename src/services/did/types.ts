import { SiweMessage } from 'siwe';
import { BasePage, IResponse } from '../types';

export interface AuthVerifyRequest {
  message: string;
  signature: string;
}

export interface GetAuthNonceData {
  nonce: string;
  issuedAt: string;
}

export interface AuthVerifyData {
  accessToken: string;
}

export interface UserInfoData {
  address: string;
  name: string;
  score: string;
  isOg: boolean;
}

export type GetAuthNonceResponse = Awaited<Readonly<IResponse<GetAuthNonceData>>>;
export type UserInfoDataResponse = Awaited<Readonly<IResponse<UserInfoData>>>;
export type AuthVerifyResponse = Awaited<Readonly<IResponse<AuthVerifyData>>>;
