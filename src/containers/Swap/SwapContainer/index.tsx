// ============================================================================
// 【SwapContainer】Facet L2 代币兑换核心交互区
// ----------------------------------------------------------------------------
// 职责：
//   提供用户输入兑换数量、选择代币、执行兑换的完整交互 UI。
//   是 Swap 页面里用户实际操作的主体区域。
//
// 整体流程：
//   1. 用户输入 token0 数量（精确输入模式）
//   2. 组件自动调用 getSimulate() 向 Facet 链模拟执行，预估 token1 输出量
//   3. 如果 token0 的授权额度不足（isApprove=true），先显示 Increase Allowance 按钮
//   4. 授权足够后，点击 Swap 按钮执行真实兑换（transferEthscriptionFacet）
//
// Facet L2 特殊性：
//   Facet 链的交易通过"把 calldata 编码后发到特定地址"来触发（不是传统的 eth_sendTransaction）。
//   这就是为什么用的是 transferEthscriptionFacet 而不是直接调合约。
//
// 关键依赖：
//   - FacetSwapStore：读取 token0/token1 状态，修改 amount/isExactTokens 等
//   - services.facet.getSimulate：Facet 链的交易模拟接口
//   - ethers.utils.parseUnits/formatUnits：单位转换（human → wei，wei → human）
//   - BigNumber.js：精确的大数比较（防止 JS 浮点误差）
//   - NumericFormat：只允许输入数字的输入框（防止非法字符）
//   - debounce：防抖，避免每次按键都触发模拟请求
// ============================================================================

'use client';

import { Box, BoxProps, InputAdornment, Link, OutlinedInput, Typography } from '@mui/material';
import LoadingButton from '@mui/lab/LoadingButton';
import { NumericFormat } from 'react-number-format';
import toast from 'react-hot-toast';
import { useQueryClient } from 'react-query';

import services, { evmService } from '@/services';
import { useEthersSigner } from '@/hooks/useEthersSigner';
import * as FacetSwapStore from '@/stores/FacetSwapStore';
import { ethers } from 'ethers';
import WarnSVG from '@/assets/icons/warn32.svg';
import SuccessSVG from '@/assets/icons/success.svg';
import SwitchButton from './SwitchButton';
import SelectTokenFacet from './SelectTokenFacet';
import { useSnapshot } from 'valtio/react';
import getTruncate from '@/utils/getTruncate';
import { useAccount } from 'wagmi';
import { approveFacet, swapExactTokensForTokens, swapTokensForExactTokens } from '@/services/evm/facet_payload';
import { FACET_CONFIG } from '@/constants/config';
import { GetCollectionDetailData } from '@/services/marketpalce/types';
import BigNumber from 'bignumber.js';
import { debounce } from 'lodash-es';
import { useEffect, useState } from 'react';
import WalletConnectButton from '@/components/WalletConnectButton';

// Props 继承 MUI BoxProps，允许传 sx 等样式属性
interface ISwapContainer extends BoxProps {
  collectionDetail?: GetCollectionDetailData; // 当前集合详情（含 Facet routerAddress）
}

const SwapContainer: React.FC<ISwapContainer> = ({ collectionDetail, ...props }) => {
  // singer：钱包签名者（用于发送以太坊交易）
  const singer = useEthersSigner();
  // account：当前连接的钱包地址（from 地址）
  const account = useAccount();
  // queryClient：react-query 客户端，用于兑换/授权后刷新余额数据
  const queryClient = useQueryClient();
  // isApproveLoading：授权按钮的 loading 状态
  const [isApproveLoading, setisApproveLoading] = useState(false);
  // isSwapLoading：兑换按钮的 loading 状态
  const [isSwapLoading, setisSwapLoading] = useState(false);

  // 订阅 FacetSwapStore 的快照（valtio 响应式）
  const facetSwapStore = useSnapshot(FacetSwapStore.store);

  // facetList：可供选择的代币列表（排除 FETH 本身，FETH 是 Facet ETH，不参与互换）
  const facetList = Object.values(facetSwapStore.pairs).filter((item) => item.address !== FACET_CONFIG.FETH_ADDRESS);

  // 获取 token0/token1 的小数位数（用于 parseUnits/formatUnits 转换）
  // ethers.utils.getAddress 统一转为 Checksum 格式（防止大小写比较问题）
  const token0Decimals =
    facetSwapStore.tokenInfo?.tokens[ethers.utils.getAddress(facetSwapStore.token0?.address || '')]?.decimals || 0;
  const token1Decimals =
    facetSwapStore.tokenInfo?.tokens[ethers.utils.getAddress(facetSwapStore.token1?.address || '')]?.decimals || 0;

  // inBalance/outBalance：把 wei 格式的余额转为人类可读的单位（如 "1.23"）
  const inBalance = ethers.utils.formatUnits(facetSwapStore.token0?.balance || 0, token0Decimals);
  const outBalance = ethers.utils.formatUnits(facetSwapStore.token1?.balance || 0, token1Decimals);

  // isApprove：是否需要授权
  // 逻辑：如果 token0 要花费的数量 > 已授权给路由合约的额度，则需要先 Approve
  // BigNumber.js 比较，避免 JS 浮点精度问题
  const isApprove = new BigNumber(facetSwapStore.token0?.amount || '0').gt(facetSwapStore.token0?.allowances || '0');

  // ★ 模拟兑换：预估输出量（不花 Gas，只是 dry-run）
  async function getSimulate() {
    try {
      FacetSwapStore.setIsLoadingSync(true); // 开始模拟，显示加载状态
      const simulateResult = await services.facet.getSimulate({
        from: account.address as string,
        // isExactTokens=true：精确输入（给定 amountIn，计算 amountOut）
        // isExactTokens=false：精确输出（给定 amountOut，计算 amountIn）
        tx_payload: facetSwapStore.isExactTokens
          ? swapExactTokensForTokens({
              to: collectionDetail?.collections.facetStat.routerAddress!,
              args: {
                amountIn: ethers.utils.parseUnits(facetSwapStore.token0?.amount || '0', token0Decimals).toString(),
                amountOutMin: '0', // 最小接受输出（0 = 不设滑点保护，生产环境应设置）
                path: [facetSwapStore.token0?.address!, facetSwapStore.token1?.address!],
                to: account.address as string,
                deadline: '1000000000000000000', // 超大数值 = 永不过期
              },
            })
          : swapTokensForExactTokens({
              to: collectionDetail?.collections.facetStat.routerAddress!,
              args: {
                amountInMax: '100000000000000000000000000000000000000000000000000', // 超大数 = 不限最大输入
                amountOut: ethers.utils.parseUnits(facetSwapStore.token1?.amount || '0', token1Decimals).toString(),
                path: [facetSwapStore.token0?.address!, facetSwapStore.token1?.address!],
                to: account.address as string,
                deadline: '1000000000000000000',
              },
            }),
      });

      if (simulateResult.result.transaction_receipt.status == 'success') {
        // 模拟成功：用返回值更新 token0/token1 的数量显示
        // return_value[0] = token0 实际消耗量，[1] = token1 实际获得量
        if (facetSwapStore.token0) {
          FacetSwapStore.setInSelectToken({
            ...facetSwapStore.token0,
            amount: ethers.utils.formatUnits(simulateResult.result.transaction_receipt.return_value[0], token0Decimals),
          });
        }

        if (facetSwapStore.token1) {
          FacetSwapStore.setOutSelectToken({
            ...facetSwapStore.token1,
            amount: ethers.utils.formatUnits(simulateResult.result.transaction_receipt.return_value[1], token1Decimals),
          });
        }
      } else {
        // 模拟失败（如流动性不足）：清空 token0 数量显示
        if (facetSwapStore.token0) {
          FacetSwapStore.setInSelectToken({
            ...facetSwapStore.token0,
            amount: '',
          });
        }
      }
    } catch (error) {
      // 静默处理，不弹 toast（模拟失败不影响用户继续操作）
    } finally {
      FacetSwapStore.setIsLoadingSync(false); // 结束模拟
    }
  }

  // 以下 aa/bb 是开发时留下的调试用示例对象（生产代码中通常应删除）
  // 展示了两种兑换方式的 payload 结构，可供开发者参考格式
  const aa = {
    op: 'call',
    data: {
      to: '0xf29e6e319ac4ce8c100cfc02b1702eb3d275029e',
      function: 'swapTokensForExactTokens',
      args: {
        amountInMax: '100000000000000000000000000000000000000000000000000',
        amountOut: '0',
        path: ['0x1673540243e793b0e77c038d4a88448eff524dce', '0x26231ad975456d53682e1b6364e9e005886281e7'],
        to: '0x4885347C039a9397Aba8BE29c04c25aFbA4fAE50',
        deadline: '1000000000000000000',
      },
    },
  };

  const bb = {
    op: 'call',
    data: {
      to: '0xf29e6e319ac4ce8c100cfc02b1702eb3d275029e',
      function: 'swapExactTokensForTokens',
      args: {
        amountIn: '4332000000000000',
        amountOutMin: '0',
        path: ['0x1673540243e793b0e77c038d4a88448eff524dce', '0x26231ad975456d53682e1b6364e9e005886281e7'],
        to: '0x4885347C039a9397Aba8BE29c04c25aFbA4fAE50',
        deadline: '1000000000000000000',
      },
    },
  };

  // 监听 token0 数量变化 → 自动触发模拟（防抖后）
  // 条件：token0 数量 > 0 且不需要 Approve（否则模拟无意义）
  useEffect(() => {
    if (new BigNumber(facetSwapStore.token0?.amount || 0).gt(0) && !isApprove) {
      setisApproveLoading(false);
      getSimulate();
    }
  }, [facetSwapStore.token0?.amount, facetSwapStore.isExactTokens, isApprove]);

  const handleTransfer = async () => {
    try {
      if (singer) {
        setisSwapLoading(true);
        await evmService.etchMarket.transferEthscriptionFacet({
          singer,
          facetAddress: FACET_CONFIG.RECEIVE_ADDRESS,
          payload: facetSwapStore.isExactTokens
            ? swapExactTokensForTokens({
                to: collectionDetail?.collections.facetStat.routerAddress!,
                args: {
                  amountIn: ethers.utils.parseUnits(facetSwapStore.token0?.amount || '0', token0Decimals).toString(),
                  amountOutMin: ethers.utils
                    .parseUnits(facetSwapStore.token1?.amount || '0', token1Decimals)
                    .toString(),
                  path: [facetSwapStore.token0?.address!, facetSwapStore.token1?.address!],
                  to: account.address as string,
                  deadline: '1000000000000000000',
                },
              })
            : swapTokensForExactTokens({
                to: collectionDetail?.collections.facetStat.routerAddress!,
                args: {
                  amountInMax: ethers.utils.parseUnits(facetSwapStore.token0?.amount || '0', token0Decimals).toString(),
                  amountOut: ethers.utils.parseUnits(facetSwapStore.token1?.amount || '0', token1Decimals).toString(),
                  path: [facetSwapStore.token0?.address!, facetSwapStore.token1?.address!],
                  to: account.address as string,
                  deadline: '1000000000000000000',
                },
              }),
        });

        toast.custom(
          <Box
            sx={{
              width: '380px',
              padding: '16px',
              border: '1px solid #2F343E',
              borderRadius: '8px',
              background: '#202229',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', mb: '8px' }}>
              <SuccessSVG style={{ marginRight: '12px' }} />
              <Typography sx={{ color: '#FFF' }}>Transaction Success</Typography>
            </Box>
          </Box>,
        );
      }
    } catch (error) {
      const err = error as unknown as Error & { data: { code: number; message: string } };
      toast.custom(
        <Box
          sx={{
            width: '380px',
            padding: '16px',
            border: '1px solid #2F343E',
            borderRadius: '8px',
            background: '#202229',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', mb: '8px' }}>
            <WarnSVG style={{ marginRight: '12px' }} />
            <Typography sx={{ color: '#FFF' }}>Transaction Failed</Typography>
          </Box>
          {err?.data?.message && <Typography sx={{ wordBreak: 'break-all' }}>{err.data.message}</Typography>}
          {err?.message && <Typography sx={{ wordBreak: 'break-all' }}>{err.message}</Typography>}
        </Box>,
      );
    } finally {
      setisSwapLoading(false);
      queryClient.invalidateQueries(['getPairs', account.address]);
    }
  };

  // ★ 增加授权额度（点 Increase Allowance 按钮调用）
  // 原理：调用 token0 合约的 approve 方法，授权 routerAddress 可花费几乎无限的代币
  // 为什么要授权：ERC-20 标准要求用户先 approve，合约才能从用户账户转移代币
  const handleIncreaseAllowance = async () => {
    try {
      if (singer) {
        setisApproveLoading(true);
        await evmService.etchMarket.transferEthscriptionFacet({
          singer,
          facetAddress: FACET_CONFIG.RECEIVE_ADDRESS,
          payload: approveFacet({
            to: facetSwapStore.token0?.address!, // token0 的合约地址（被 approve 的代币）
            args: [
              collectionDetail?.collections.facetStat.routerAddress!, // 授权给路由合约
              '57896044618658097711785492504343953926634992332820282019728792003956564819968', // 2^255（几乎无限额度）
            ],
          }),
        });

        // 授权成功提示
        toast.custom(
          <Box
            sx={{
              width: '380px',
              padding: '16px',
              border: '1px solid #2F343E',
              borderRadius: '8px',
              background: '#202229',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', mb: '8px' }}>
              <SuccessSVG style={{ marginRight: '12px' }} />
              <Typography sx={{ color: '#FFF' }}>Transaction Success</Typography>
            </Box>
          </Box>,
        );
      }
    } catch (error) {
      // 授权失败：清除 loading 状态并显示错误
      const err = error as unknown as Error & { data: { code: number; message: string } };
      setisApproveLoading(false);
      toast.custom(
        <Box
          sx={{
            width: '380px',
            padding: '16px',
            border: '1px solid #2F343E',
            borderRadius: '8px',
            background: '#202229',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', mb: '8px' }}>
            <WarnSVG style={{ marginRight: '12px' }} />
            <Typography sx={{ color: '#FFF' }}>Transaction Failed</Typography>
          </Box>
          {err?.data?.message && <Typography sx={{ wordBreak: 'break-all' }}>{err.data.message}</Typography>}
          {err?.message && <Typography sx={{ wordBreak: 'break-all' }}>{err.message}</Typography>}
        </Box>,
      );
    } finally {
      // 无论成功失败，刷新余额和授权额度数据
      queryClient.invalidateQueries(['getPairs', account.address]);
    }
  };

  return (
    <Box {...props}>
      {/* 标题区："Swap" + Powered by FacetSwap.com 链接 */}
      <Box
        sx={{
          fontSize: '20px',
          fontWeight: 500,
          fontFamily: 'Poppins',
          mb: '22px',
          display: 'flex',
          alignItems: 'flex-end',
          gap: '12px',
        }}
      >
        <Box>Swap</Box>
        <Link
          sx={{ color: 'rgba(255,255,255,0.55)', fontSize: '13px', textDecoration: 'none' }}
          href="https://facetswap.com"
          target="_blank"
        >
          Powered by <span style={{ color: '#5a6b92' }}>FacetSwap.com</span>
        </Link>
      </Box>

      {/* token0 输入区（卖出代币） */}
      <Box
        sx={{
          p: '20px 16px 10px',
          boxSizing: 'border-box',
          borderRadius: '8px',
          border: '1px solid #272B33',
          background: '#24262E',
        }}
      >
        {/* NumericFormat：数字格式化输入框，防止用户输入非数字字符
            - allowNegative=false：不允许负数
            - thousandSeparator：千分位分隔（1,000.00）
            - decimalScale=6：最多 6 位小数
            - debounce(500)：防抖 500ms，避免每次按键都触发模拟 */}
        <NumericFormat
          autoComplete="off"
          customInput={OutlinedInput}
          allowNegative={false}
          thousandSeparator
          valueIsNumericString
          decimalScale={6}
          placeholder="0"
          value={facetSwapStore.token0?.amount || ''}
          onValueChange={debounce((data) => {
            // 如果输入为 0，同时清空 token1 的预估输出
            if (new BigNumber(data.value).eq(0)) {
              FacetSwapStore.setOutSelectToken({ ...facetSwapStore.token1!, amount: '0' });
            }
            // 更新 token0 数量，设置为精确输入模式
            FacetSwapStore.setInSelectToken({ ...facetSwapStore.token0!, amount: data.value });
            FacetSwapStore.setIsExactTokens(true); // 精确输入模式：指定花多少 token0
          }, 500)}
          endAdornment={
            // 右侧：代币选择器下拉
            <InputAdornment position="end">
              <SelectTokenFacet
                value={facetSwapStore.token0}
                facetList={facetList}
                onSelect={(data) => {
                  FacetSwapStore.setInSelectToken(data);
                  FacetSwapStore.setHistoryAddress(data.address); // 同步更新历史记录查询地址
                }}
              />
            </InputAdornment>
          }
          sx={{
            width: '100%',
            height: '36px',
            mb: '8px',
            p: 0,
            '& input': {
              textAlign: 'left',
              fontSize: '32px',
              fontFamily: 'Inter',
              p: '0',
            },
            // 去掉 OutlinedInput 默认边框，融合到父容器的整体边框
            '&.MuiOutlinedInput-root': {
              fieldset: { borderColor: 'transparent' },
              '&:hover fieldset': { borderColor: 'transparent', borderWidth: '1px' },
              '&.Mui-focused fieldset': { borderColor: 'transparent', borderWidth: '1px' },
            },
          }}
        />

        {/* 余额显示 + Max 按钮 */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Typography sx={{ color: 'rgba(255, 255, 255, 0.45)' }}>Balance</Typography>
          <Typography sx={{ color: 'rgba(255, 255, 255, 0.90)', fontWeight: 500, mr: '4px' }}>
            {/* 只有 decimals 已知（>0）才显示余额，否则显示 '--' */}
            {`${new BigNumber(inBalance).gte(0) && Boolean(token0Decimals) ? getTruncate(inBalance, 3) : '--'}`}
          </Typography>
          {/* Max 按钮：一键填入全部余额 */}
          <Typography
            sx={{ color: '#E5FF65', fontWeight: 500, cursor: 'pointer' }}
            onClick={() => {
              FacetSwapStore.setIsExactTokens(true);
              FacetSwapStore.setInSelectToken({
                ...facetSwapStore.token0!,
                amount: ethers.utils.formatUnits(facetSwapStore.token0?.balance || 0, token0Decimals),
              });
            }}
          >
            Max
          </Typography>
        </Box>
      </Box>

      {/* 中间切换按钮（互换 token0 和 token1 的位置） */}
      <SwitchButton collectionDetail={collectionDetail} />

      {/* token1 输入区（买入代币，只读，由模拟结果填充） */}
      <Box
        sx={{
          p: '20px 16px 10px',
          boxSizing: 'border-box',
          borderRadius: '8px',
          border: '1px solid #272B33',
          background: '#24262E',
        }}
      >
        {/* disabled：token1 输出量由系统计算，用户不能手动编辑 */}
        <NumericFormat
          disabled
          autoComplete="off"
          customInput={OutlinedInput}
          allowNegative={false}
          thousandSeparator
          placeholder="0"
          valueIsNumericString
          decimalScale={6}
          value={facetSwapStore.token1?.amount || ''}
          endAdornment={
            // 右侧：token1 代币选择器
            <InputAdornment position="end">
              <SelectTokenFacet
                value={facetSwapStore.token1}
                facetList={facetList}
                onSelect={(data) => {
                  FacetSwapStore.setOutSelectToken(data);
                  FacetSwapStore.setHistoryAddress(data.address);
                }}
              />
            </InputAdornment>
          }
          sx={{
            width: '100%',
            height: '36px',
            mb: '8px',
            p: 0,
            '& input': {
              textAlign: 'left',
              fontSize: '32px',
              fontFamily: 'Inter',
              p: 0,
            },
            // disabled 状态下 MUI 会把文字变灰，这里强制保持白色（token1 输出量应清晰可见）
            '&.Mui-disabled': {
              WebkitTextFillColor: '#fff',
            },
            '&.MuiOutlinedInput-root': {
              fieldset: { border: 'none' },
            },
          }}
        />
        {/* token1 余额显示（无 Max 按钮，token1 是输出方向） */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Typography sx={{ color: 'rgba(255, 255, 255, 0.45)' }}>Balance</Typography>
          <Typography sx={{ color: 'rgba(255, 255, 255, 0.90)', fontWeight: 500, mr: '4px' }}>
            {`${new BigNumber(outBalance).gte(0) && Boolean(token0Decimals) ? getTruncate(outBalance, 3) : '--'}`}
          </Typography>
        </Box>
      </Box>

      {/* 操作按钮区：WalletConnectButton 包裹，未连接钱包时自动显示"Connect Wallet" */}
      <WalletConnectButton
        sx={{
          height: '52px',
          fontSize: '16px',
          fontWeight: 500,
          textTransform: 'capitalize',
          mt: '40px',
          borderRadius: '46px',
          background: '#E5FF65',
          color: '#333',
          '&.Mui-disabled': {
            background: '#e5ff6566', // 禁用态：半透明黄绿
          },
        }}
      >
        {/* 条件渲染：需要授权时显示 Increase Allowance，否则显示 Swap */}
        {isApprove ? (
          <LoadingButton
            fullWidth
            disableElevation
            color="primary"
            loading={isApproveLoading}
            onClick={handleIncreaseAllowance}
            variant="contained"
            sx={{
              height: '52px',
              fontSize: '16px',
              fontWeight: 500,
              textTransform: 'capitalize',
              mt: '40px',
              borderRadius: '46px',
              background: '#E5FF65',
              color: '#333',
              '&.Mui-disabled': {
                background: '#e5ff6566',
              },
            }}
          >
            Increase Allowance
          </LoadingButton>
        ) : (
          <LoadingButton
            fullWidth
            disableElevation
            color="primary"
            // isSwapLoading：等待交易广播；isLoadingSync：等待模拟结果
            loading={isSwapLoading || facetSwapStore.isLoadingSync}
            onClick={handleTransfer}
            variant="contained"
            sx={{
              height: '52px',
              fontSize: '16px',
              fontWeight: 500,
              textTransform: 'capitalize',
              mt: '40px',
              borderRadius: '46px',
              background: '#E5FF65',
              color: '#333',
              '&.Mui-disabled': {
                background: '#e5ff6566',
              },
            }}
          >
            Swap
          </LoadingButton>
        )}
      </WalletConnectButton>
    </Box>
  );
};

export default SwapContainer;
