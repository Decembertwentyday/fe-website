import { BasePage, IResponse, SocialPlatform } from '../types';

export interface GetLaunchpadListRequest {
  status?: string;
  'page.size': number;
  'page.index': number;
}

export interface GetLaunchpadInfoRequest {
  name: string;
  address: string;
}

export interface GetLaunchpadItem {
  name: string;
  launchpadContract: string;
  mintPrice: string;
  socialPlatform: SocialPlatform;
  previewImage: string;
  projectImage: string;
  desc: string;
  startTime: string;
  endTime: string;
  author: string;
  blueVerified: boolean;
}

export interface GetLaunchpadListData {
  list: GetLaunchpadItem[];
  page: BasePage;
}

export interface GetLaunchpadInfoData {
  project: GetLaunchpadItem;
  isWhitelist: boolean;
  whitelist: string[];
}

export type GetLaunchListResponse = Awaited<Readonly<IResponse<GetLaunchpadListData>>>;
export type GetLaunchpadInfoResponse = Awaited<Readonly<IResponse<GetLaunchpadInfoData>>>;
