// ============================================================================
// 【Launchpad 服务层】发射台接口封装
// ----------------------------------------------------------------------------
// 做什么：
//   提供两个核心接口给 UI 调用：
//     1) getLaunchpadList  → 获取发射台列表（首页展示）
//     2) getLaunchpadInfo  → 获取某个发射台项目的详情（详情页）
//
// 什么是 "Launchpad（发射台）"：
//   类似于 NFT/铭文领域的 "众筹首发平台"。项目方可以在 Launchpad 上发布即将
//   开放铸造的项目，用户可以参与铸造（mint）。常见于 Web3 的发币/发行 NFT 场景。
//
// 原理：
//   继承同一个 ApiClient（依赖注入），所有请求自动带上 BaseURL、超时、认证等配置。
//   这种 "Service 类 + ApiClient 注入" 的模式让不同模块（market、ethscriptions、
//   launchpad、did 等）共享同一个 HTTP 客户端，避免重复代码。
// ============================================================================

import ApiClient from '@/services/network/ApiClient';
import {
  GetLaunchpadListRequest,
  GetLaunchListResponse,
  GetLaunchpadInfoRequest,
  GetLaunchpadInfoResponse,
} from './types';
import { getQueryParams } from '../getQueryParams';

// 发射台服务类
export default class LaunchpadService {
  // 持有一个 ApiClient 实例（注入进来的，不是自己 new 的，便于复用与测试）
  private apiClient: ApiClient;

  // 构造函数：接收 ApiClient 实例（由外层 services/index.ts 创建并传入）
  constructor(apiClient: ApiClient) {
    this.apiClient = apiClient;
  }

  /**
   * 获取发射台列表
   * 用途：发射台首页 /launchpad 显示所有正在/即将进行的项目
   * 入参：data 包含分页、分类、排序等查询条件
   * 出参：项目数组（每个项目含名称、Logo、状态、价格、进度等）
   */
  async getLaunchpadList(data: GetLaunchpadListRequest): Promise<GetLaunchListResponse> {
    // 把对象转为 URL 查询字符串：{page: 1, size: 20} → "page=1&size=20"
    const queryParams = getQueryParams(data as any);
    // 拼接 URL 发起 GET 请求
    return await this.apiClient.get<GetLaunchListResponse>(`/launchpad/list?${queryParams}`);
  }

  /**
   * 获取单个发射台项目详情
   * 用途：项目详情页 /launchpad/[name] 展示完整信息（描述、铸造规则、剩余数量等）
   * 入参：data 必含 name（项目标识），其余字段作为 query 参数
   * 出参：单个项目的详细数据
   */
  async getLaunchpadInfo(data: GetLaunchpadInfoRequest): Promise<GetLaunchpadInfoResponse> {
    // 把 name 从 data 中解构出来，放进 URL 路径；其余字段作为 query 参数
    // 这种 "路径参数 + query 参数" 混用的写法：
    //   /launchpad/get/MyProject?lang=en&version=2
    //   - name 是资源标识，必须放路径里（语义清晰、便于 SEO）
    //   - 其他可选参数放 query 里（不影响资源定位）
    const { name, ...props } = data;
    const queryParams = getQueryParams(props as any);
    return await this.apiClient.get<GetLaunchpadInfoResponse>(`/launchpad/get/${name}?${queryParams}`);
  }
}
