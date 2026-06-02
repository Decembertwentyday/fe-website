import ApiClient from '@/services/network/ApiClient';
import { GetDomainCategoryResponse } from './types';

export default class DomainService {
  private apiClient: ApiClient;

  constructor(apiClient: ApiClient) {
    this.apiClient = apiClient;
  }

  async GetDomainCategory(namespace: string, owner?: string): Promise<GetDomainCategoryResponse> {
    if (owner) {
      return await this.apiClient.get<GetDomainCategoryResponse>(
        `/domains/owned/categories/${owner}?namespace=${namespace}`,
      );
    }
    return await this.apiClient.get<GetDomainCategoryResponse>(`/domains/categories/${namespace}`);
  }
}
