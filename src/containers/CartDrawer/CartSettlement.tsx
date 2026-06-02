// ============================================================================
// 【购物车结算区】抽屉底部的总计 + 一键购买按钮
// ----------------------------------------------------------------------------
// 职责：
//   1. 计算有效订单的总价（跳过失效订单）
//   2. 点击“Buy Now”后调用智能合约的 batchBuyEthscription 方法批量购买
//   3. 交易完成后弹出结果面板，成功则清空购物车并更新本地缓存
//
// 核心技术点：
//   - useEthersSigner：从 wagmi 帐户提取 ethers v5 的 Signer，用于签发交易
//   - BigNumber.reduce 累加价格：避免精度丢失
//   - filter 过滤失效订单：只给有效订单计价、只提交有效订单去合约
//   - try-catch-finally：统一控制 loading 状态和结果弹窗，避免状态残留
//
// 完整交易流程：
//   点击 Buy Now → 验证登录 → 调用 sweep 合约 → 钱包弹窗 → 用户确认 →
//   交易上链 → 等待确认 → 返回回执 → 成功提示 + 清空购物车 + 刷新列表
// ============================================================================

'use client';

import { Fragment, useState } from 'react';
import BigNumber from 'bignumber.js';
import { useSnapshot } from 'valtio';
import { LoadingButton } from '@mui/lab';
import { Box, Typography } from '@mui/material';

import * as CartStore from '@/stores/CartStore';
import * as EthscriptionsStore from '@/stores/EthscriptionsStore';
import { evmService } from '@/services';
import { useEthersSigner } from '@/hooks/useEthersSigner';
import WalletConnectButton from '@/components/WalletConnectButton';
import ResultViewSweep from '../ResultViewSweep';
import { ContractReceipt } from 'ethers';
import { ICartStore } from '@/stores/CartStore';

const CartSettlement = () => {
  // 订阅购物车状态（as ICartStore 是为了去掉 valtio 返回的 readonly 修饰）
  const cartStore = useSnapshot(CartStore.store) as ICartStore;
  // 从 wagmi 转换出的 ethers Signer，不存在表示未连接钱包
  const singer = useEthersSigner();

  // 提交中状态，控制按钮 loading
  const [isSumbit, setIsSubmit] = useState<boolean>(false);
  // 结果弹窗控制
  const [openResult, setOpenResult] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  // 交易回执（含 txHash、blockNumber 等，结果面板会用到）
  const [txResult, setTxResult] = useState<ContractReceipt>();

  // 【总价计算】累加所有有效订单的价格
  // 使用 reduce + BigNumber 避免精度丢失
  // 失效订单（签名为空）计作 0，不参与累加
  const accumlatePrice = cartStore.cartOrder?.orders.reduce((accumulator: string, currentValue) => {
    const _price = currentValue.order.signature.trim() == '' ? '0' : currentValue.order.price;
    return new BigNumber(accumulator).plus(_price).toString();
  }, '0');

  // 【有效订单过滤】只留下签名非空的订单（这些才是能购买的）
  const efficientList = cartStore?.cartOrder?.orders.filter((item) => item.order.signature.trim() !== '') || [];

  // 【一键购买逻辑】
  async function handleOnClickBuySweep() {
    try {
      setIsSubmit(true); // 启动 loading
      if (cartStore.cartOrder?.orders && singer) {
        // 调用 evmService 中的 etchMarketSweep 合约封装方法
        const result = await evmService.etchMarketSweep.batchBuyEthscription({
          singer, // 签名者（用户钱包）
          ethscriptionSweep: {
            sweepAddress: cartStore.cartOrder.sweepAddress, // sweep 合约地址
            orders: efficientList, // 只传递有效订单
          },
          sellPrice: accumlatePrice!, // 总价（以 wei 为单位，要作为 msg.value 发送）
        });
        if (result) {
          setIsSuccess(true);
          setTxResult(result); // 保存交易回执供结果面板显示
        }
      }
    } catch (error) {
      // 出错场景：用户拒绝签名、Gas 不足、合约 revert 等
      setIsSuccess(false);
    } finally {
      // 无论成败都要：关闭 loading + 打开结果弹窗
      setIsSubmit(false);
      setOpenResult(true);
    }
  }

  return (
    <Fragment>
      {/* 结算区底部面板 */}
      <Box sx={{ padding: '20px 20px 40px 20px', background: '#202229' }}>
        {/* 总价显示行 */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: '16PX' }}>
          <Typography sx={{ color: 'rgba(229, 255, 101, 1)', fontSize: '14px', fontWeight: '500' }}>
            Total Pay
          </Typography>
          <Box>
            <Typography sx={{ color: 'rgba(229, 255, 101, 1)', fontSize: '16px', fontWeight: '500' }}>
              {/* wei → ETH 转换与 CartList 中同原理 */}
              {`${
                accumlatePrice ? new BigNumber(accumlatePrice || 0).div(new BigNumber(10).pow(18)).toString() : '--'
              } ETH`}
            </Typography>
            {/* 占位：未来加入 USD 换算显示 */}
          </Box>
        </Box>

        {/*
          WalletConnectButton 包裹：未连钱包时点击子按钮会拦截并弹出连接钱包对话框
          这是项目里常见的 "权限包裹" 模式：避免每个按钮都重复检查登录状态
        */}
        <WalletConnectButton>
          <LoadingButton
            variant="contained"
            fullWidth
            disableElevation
            loading={isSumbit} // 提交中显示转圈
            // 禁用条件：购物车为空或所有订单都失效
            disabled={cartStore.orderIds.length <= 0 || efficientList.length <= 0}
            color="primary"
            sx={{
              width: '100%',
              borderRadius: '46px',
              background: '#E5FF65',
              color: '#171A1F',
              fontSize: '14px',
              textTransform: 'capitalize',
              '&:hover': {
                background: 'rgba(229,255,101,0.7)',
              },
            }}
            onClick={handleOnClickBuySweep}
          >
            Buy Now
          </LoadingButton>
        </WalletConnectButton>
      </Box>

      {/* 交易结果弹窗（sweep 合约专用，与普通单个购买区别） */}
      <ResultViewSweep
        title="Confirmation"
        open={openResult}
        txResult={txResult!}
        onClose={async () => {
          setOpenResult(false);
          if (isSuccess) {
            // 成功后的清理动作：
            CartStore.setOpen(false); // 1. 关闭购物车抽屉
            CartStore.clearAllEthsciption(); // 2. 清空购物车
            EthscriptionsStore.removeListedItem(efficientList); // 3. 从本地列表中移除已购买项（优化体验，不需要等后端刷新）
          }
        }}
        isSuccess={isSuccess}
      />
    </Fragment>
  );
};

export default CartSettlement;
