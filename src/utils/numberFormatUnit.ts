// ============================================================================
// 【numberFormatUnit】大数单位转换（K/M/B 缩写）
// ----------------------------------------------------------------------------
// 场景：展示持有者总量、铸造数量等大数字时，转为 1.5K / 2.3M 等可读格式
// 用法：numberFormatUnit('1500000') → { value: '1.5', unit: 'M' }
//       numberFormatUnit('800')     → { value: '800', unit: '' }（< 1000 不转换）
// 返回对象，调用方自行拼接：`${value}${unit}`
// NaN 输入时返回 { value: '--', unit: '' }（安全降级）
// ============================================================================
import BigNumber from 'bignumber.js';
  let result: { value: string | number; unit: string } = { value, unit: '' };

  if (new BigNumber(value).isNaN()) {
    result.value = '--';
    return result;
  }

  const k = 1000;

  const units = ['', 'K', 'M', 'B'];

  if (new BigNumber(value).gte(k)) {
    const s = new BigNumber(value);
    const i = Math.floor(Math.log(new BigNumber(value).toNumber()) / Math.log(k));

    result = {
      value: new BigNumber(value).div(Math.pow(k, i)).toString(),
      unit: units[i],
    };
  }

  return result;
};
