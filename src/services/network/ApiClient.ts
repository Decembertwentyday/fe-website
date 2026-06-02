/**
 * ==============================================================
 * 文件：src/services/network/ApiClient.ts
 * 作用：封装 axios 的基础 HTTP 请求类
 *
 * 为什么要封装一个类，而不直接用 axios？
 *   1. 统一接口：所有请求都经过这一层，方便统一处理错误、超时等
 *   2. 泛型支持：通过 TypeScript 泛型，每个请求都有明确的返回类型，
 *      IDE 可以自动提示返回数据的结构，避免写错字段名
 *   3. 关注分离：业务代码不需要知道底层用的是 axios，
 *      以后换成 fetch 或其他库，只改这一个文件即可
 *
 * 泛型（<T>）是什么？
 *   类比：泛型是"占位符"。就像函数的参数是值的占位符，
 *   泛型是类型的占位符。
 *   例：get<UserInfo>('/user') 表示这个请求返回 UserInfo 类型的数据
 * ==============================================================
 */

// 导入 axios 的类型定义（不是运行时代码，只用于 TypeScript 类型检查）
import { AxiosInstance, AxiosRequestConfig } from 'axios';
// AxiosInstance：axios.create() 创建的实例的类型
// AxiosRequestConfig：axios 请求配置的类型（headers、timeout 等）

/**
 * ApiClient 类：HTTP 请求的基础封装
 * 这个类不直接创建 axios 实例，而是接收一个外部传入的 axios 实例
 * 这种设计叫"依赖注入"（Dependency Injection）：
 * 好处是外部可以在创建实例时配置不同的 baseURL、拦截器等
 */
export default class ApiClient {
  // public：这个属性可以从类外部访问（区别于 private 只能内部访问）
  // client：存储 axios 实例，供各个方法使用
  public client: AxiosInstance;

  /**
   * 构造函数：创建 ApiClient 时必须传入一个已配置好的 axios 实例
   * 注意：参数名拼错了（应该是 client，写成了 alient），这是代码里的 typo
   */
  constructor(alient: AxiosInstance) {
    this.client = alient; // 把传入的 axios 实例保存到实例属性上
  }

  /**
   * POST 请求：向服务器发送数据（常用于创建资源、提交表单）
   * @param path     请求路径（相对路径，如 '/user/login'）
   * @param payload  请求体数据（会被序列化为 JSON 发送）
   * @param config   可选的额外配置（如自定义 headers）
   * @returns        服务器返回的数据，类型为 TResponse
   *
   * 泛型 <TRequest, TResponse>：
   *   TRequest = 请求体的类型（你发什么）
   *   TResponse = 响应数据的类型（你收什么）
   */
  async post<TRequest, TResponse>(path: string, payload: TRequest, config?: AxiosRequestConfig): Promise<TResponse> {
    const response = await this.client.post(path, payload, config);
    // ↑ axios 发 POST 请求，response 是完整的 axios 响应对象
    // response 的结构：{ data, status, headers, config, ... }
    return response.data;
    // ↑ 只返回 response.data 部分（后端实际返回的 JSON 数据）
    // 这样业务代码拿到的就是纯粹的业务数据，不用再写 .data
  }

  /**
   * PATCH 请求：局部更新资源（比 PUT 更常用于"修改某几个字段"）
   * 使用场景：修改用户昵称、更改商品价格等
   */
  async patch<TRequest, TResponse>(path: string, payload: TRequest, config?: AxiosRequestConfig): Promise<TResponse> {
    const response = await this.client.patch<TResponse>(path, payload, config);
    return response.data;
  }

  /**
   * DELETE 请求：删除资源
   * 使用场景：取消挂单、删除记录等
   * 注意：DELETE 请求通常没有请求体，所以这里没有 payload 参数
   */
  async delete<TResponse>(path: string, config?: AxiosRequestConfig): Promise<TResponse> {
    const response = await this.client.delete<TResponse>(path, config);
    return response.data;
  }

  /**
   * PUT 请求：完整替换资源（替换整个对象，而不是局部更新）
   * 使用场景：更新整个用户资料等
   */
  async put<TRequest, TResponse>(path: string, payload: TRequest): Promise<TResponse> {
    const response = await this.client.put<TResponse>(path, payload);
    return response.data;
  }

  /**
   * GET 请求：从服务器获取数据（最常用的请求方式）
   * 使用场景：获取列表、获取详情等所有"读取"操作
   * @param path   请求路径（可以包含 query string，如 '/list?page=1&size=20'）
   * @param config 可选配置（如设置更长的 timeout）
   */
  async get<TResponse>(path: string, config?: AxiosRequestConfig): Promise<TResponse> {
    const response = await this.client.get<TResponse>(path, config);
    return response.data;
  }
}
