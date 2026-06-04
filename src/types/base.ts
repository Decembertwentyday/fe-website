/**
 * ==============================================================
 * 文件：src/types/base.ts
 * 作用：TypeScript 类型系统的「补丁 / 扩展声明」
 *
 * 当前内容说明：
 *   下面被注释掉的代码是为 valtio 库补充 useSnapshot 的类型定义。
 *   某些 valtio 版本与 TypeScript 配合时，useSnapshot 的返回类型
 *   不能正确推断 proxy 对象的字段类型，需要手动 declare module 扩展。
 *
 * 为什么整文件几乎为空？
 *   项目把大部分类型定义放在各模块的 types.ts 里（如 services/ethscriptions/types.ts），
 *   这个文件保留作为「全局类型扩展」的占位，需要时再 uncomment 或添加新声明。
 *
 * 如果你遇到 useSnapshot(store) 类型报错，可以尝试取消注释：
 *   declare module 'valtio' {
 *     function useSnapshot<T extends object>(p: T): T;
 *   }
 * ==============================================================
 */

// declare module 'valtio' {
//   function useSnapshot<T extends object>(p: T): T;
// }
