// ============================================================================
// 【getFacetTokenInfo】从 Facet DEX 交易对数据中提取指定 Token 的余额和授权量
// ----------------------------------------------------------------------------
// 背景：Facet 是 L2 链，pairsData 是 swap 页面查到的所有交易对数据。
// 逻辑：
//   1. 如果 token 是 FETH（原生代币），取 pairsList[0] 的 token1 余额
//   2. 否则按 token.address 在 pairsList 中找到对应的交易对，取 token1 余额/授权
// 返回：{ balance: '余额字符串', allowances: '授权量字符串' }
// ============================================================================
import { PairsData, PairsToken } from '@/services/facet/types';

export default function getFacetTokenInfo(pairsData: PairsData, token?: PairsToken) {
  const pairsList = Object.values(pairsData);

  let result = { balance: '0', allowances: '0' };

  console.log(token?.symbol, 'symbol');

  if (!token) {
    return result;
  }

  result = {
    balance: pairsList[0].user_balances.token1,
    allowances: pairsList[0].user_allowances.token1,
  };

  if (token.symbol !== 'FETH') {
    const item = pairsList.find((item) => item.token0.address === token.address);
    if (item) {
      result = {
        balance: item.user_balances.token1,
        allowances: item.user_allowances.token1,
      };
    }
  }

  return result;
}
