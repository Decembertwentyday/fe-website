/**
 * ==============================================================
 * 文件：src/services/getQueryParams.ts
 * 作用：把 JavaScript 对象转换为 URL 查询字符串
 *
 * 什么是查询字符串（Query String）？
 *   URL 中 ? 后面的部分，例如：
 *   /api/list?page.size=20&page.index=1&status=All
 *   这里 page.size=20&page.index=1&status=All 就是查询字符串
 *
 * 为什么不用原生的 URLSearchParams？
 *   原生 URLSearchParams 对数组的处理格式是 key=val1&key=val2
 *   qs 库提供更丰富的选项，比如 arrayFormat: 'repeat' 也是这种格式，
 *   但 qs 还支持嵌套对象、点号分隔的 key 等更复杂的场景
 *   此外，原生 URLSearchParams 不支持 null/undefined 的过滤
 *
 * 注意：上面被注释掉的 URLSearchParams 代码是最初的实现，后来改用了 qs
 * ==============================================================
 */

import qs from 'qs';
// ↑ qs 是一个强大的查询字符串解析/序列化库
// 比原生 URLSearchParams 功能更强（支持嵌套对象、数组多种格式等）

/**
 * 把参数对象转为 URL 查询字符串
 *
 * @param data - 参数对象，key 为参数名，value 为参数值
 * @returns    - URL 查询字符串（不含 ?，只含 key=value&key=value 部分）
 *
 * 使用示例：
 *   getQueryParams({ 'page.size': 20, 'page.index': 1, status: 'All' })
 *   → 'page.size=20&page.index=1&status=All'
 *
 *   调用方拼接：`/api/list?${getQueryParams(params)}`
 *   → '/api/list?page.size=20&page.index=1&status=All'
 */
export function getQueryParams(data: { [key: string | number]: string | number }) {
  // 注释掉的原始实现（URLSearchParams 方式）：
  // const params = new URLSearchParams();
  // Object.keys(data).forEach((key) => {
  //   params.append(key, String(data[key]));
  // });
  // params.toString();

  return qs.stringify(data, { arrayFormat: 'repeat' });
  // ↑ qs.stringify：把对象序列化为查询字符串
  // { arrayFormat: 'repeat' } 选项：
  //   对于数组值，格式为 key=val1&key=val2（重复 key）
  //   例如：{ tags: ['a', 'b'] } → 'tags=a&tags=b'
  //   （区别于 bracket 格式：tags[0]=a&tags[1]=b）
}
