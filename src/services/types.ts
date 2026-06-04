/**
 * ==============================================================
 * 文件：src/services/types.ts
 * 作用：所有 Service 层共用的 HTTP 响应与分页类型定义
 *
 * 为什么单独一个 types.ts，而不是写在 ApiClient 里？
 *   这些是「业务协议」类型（后端 API 的 JSON 结构），
 *   会被 ethscriptions、marketplace、did 等多个 Service 复用。
 *   集中定义避免每个 Service 重复写 IResponse<T>。
 *
 * 命名约定：
 *   IResponse<T>  → 标准 API 响应包装（code + message + data）
 *   BasePage      → 分页元信息（size/index/total）
 *   DataResult<T> → 带 error 字段的结果（部分旧代码用）
 * ==============================================================
 */

/** 后端统一响应格式：{ code: 200, message: 'ok', data: {...} } */
export interface IResponse<T> {
  code: number;
  message: string;
  data: T;
}

/** 错误对象结构（用于 DataResult 模式） */
export interface ResultError {
  message: string;
  code?: number;
}

/**
 * 双轨结果类型：要么有 response，要么有 error
 * 用途：某些函数不想 throw，而是返回 { error } 让调用方判断
 */
export type DataResult<T> = {
  response?: T;
  error?: ResultError;
};

/** HTTP 请求头键值对 */
export type HttpHeaders = {
  [key: string]: string;
};

/** axios 请求的额外配置（headers、query params 等） */
export type RequestConfig = {
  headers?: HttpHeaders;
  params?: any;
};

/**
 * 分页基础结构
 * total 用 string 是因为后端可能返回超大整数（超过 JS Number 安全范围）
 */
export interface BasePage {
  size: number;
  index: number;
  total: string;
}

/** 项目/集合的社交媒体链接（Launchpad、Collection 详情页展示用） */
export interface SocialPlatform {
  github: string;
  twitter: string;
  discord: string;
  website: string;
  telegram: string;
}

/** SocialPlatform 的 key 联合类型（用于动态渲染社交图标） */
export type SocialPlatformKey = keyof SocialPlatform;
