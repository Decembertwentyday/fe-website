import { IResponse } from '../types';

export interface GetDomainCategoryData {
  categories: GetDomainCategoryItem[];
}

export interface GetDomainCategoryItem {
  category: string;
  example: string;
  total: string;
}

export type GetDomainCategoryResponse = Awaited<Readonly<IResponse<GetDomainCategoryData>>>;
