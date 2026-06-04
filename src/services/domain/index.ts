/**
 * ==============================================================
 * 文件：src/services/domain/index.ts
 * 作用：域名铭文（Domain Ethscription）相关的 API 封装
 *
 * 什么是域名铭文？
 *   类似 ENS 的 .eth 域名，但刻在 Ethscriptions 协议上。
 *   例如 owner.eth 可以作为链上身份标识，在市场 /market/domain 分类展示。
 *
 * 设计模式：
 *   与其他 Service 一致：Class + ApiClient 依赖注入
 *   UI 调用：services.domain.GetDomainCategory(namespace, owner?)
 *
 * 两个接口的区别：
 *   - 无 owner：查某 namespace 下所有域名分类统计（公开数据）
 *   - 有 owner：查某地址拥有的域名分类（个人资产页用）
 * ==============================================================
 */

import ApiClient from '@/services/network/ApiClient';
import { GetDomainCategoryResponse } from './types';

export default class DomainService {
  private apiClient: ApiClient;

  constructor(apiClient: ApiClient) {
    this.apiClient = apiClient;
  }

  /**
   * 获取域名分类数据
   * @param namespace 域名空间标识（如项目定义的 domain namespace）
   * @param owner     可选：钱包地址。传入则查该地址拥有的域名分类
   *
   * REST 路径设计：
   *   有 owner → GET /domains/owned/categories/{owner}?namespace=xxx
   *   无 owner → GET /domains/categories/{namespace}
   * 为什么路径不同：「某人的资产」和「全局分类」是不同资源，REST 语义更清晰
   */
  async GetDomainCategory(namespace: string, owner?: string): Promise<GetDomainCategoryResponse> {
    if (owner) {
      return await this.apiClient.get<GetDomainCategoryResponse>(
        `/domains/owned/categories/${owner}?namespace=${namespace}`,
      );
    }
    return await this.apiClient.get<GetDomainCategoryResponse>(`/domains/categories/${namespace}`);
  }
}
