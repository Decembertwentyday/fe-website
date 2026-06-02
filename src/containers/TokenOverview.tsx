// ============================================================================
// 【TokenOverview】单个 Token 的铸造详情概览
// ----------------------------------------------------------------------------
// 职责：
//   展示某个 ERC-20 铭文 Token 的详情信息（铸造进度条、各项统计数据）
//   并提供 Ethscribe（铸造）按钮，让用户执行铭文操作。
//
// Props：
//   p: string   — 协议名（如 'erc-20'、'erc--20'、'terc-20'）
//   tick: string — 代币符号（如 'ordi'）
//   ca?: string  — 合约地址（可选，erc-20s 专属）
//
// 关键概念 isErc20S：
//   isErc20S = p === 'erc--20' && ca 非空
//   erc-20s 是 erc-20 的升级版，通过链上智能合约管理铸造规则（walletLimit、blockInterval 等）
//   普通 erc-20 通过 Ethscription 协议铸造（写入链上的特定格式文本）
//
// 两种铸造路径：
//   isErc20S=true  → erc20sEthscribe()  → 调用链上合约（evmService.erc20Ethscriptions.ethscribe）
//   isErc20S=false → handleGetEthscribe() → 先从后端获取铭文数据，再发送 Ethscription 交易
//
// 三个 useEffect 分工：
//   1. 组件挂载时 → getErc20Info()（获取 Token 基本信息）
//   2. address/erc20Info 变化时 → getInscribeCount() + getlLastInscribeBlock()（读取链上数据）
//   3. erc20Info/isErc20S 变化时 → getMintedInfo()（从链上读取已铸造数量）
//
// isWaiting（erc-20s 专属）：
//   blockInterval 是合约规定的两次 mint 之间的最小间隔区块数。
//   getlLastInscribeBlock 读取用户上次 mint 的区块，
//   如果 (当前区块 - 上次区块) <= blockInterval → isWaiting=true → 按钮显示 'Waiting...'
// ============================================================================

import { Box, BoxProps, Button, Link, Typography, styled } from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
import services, { evmService } from '@/services';

import { GetErc20InfoItem } from '@/services/ethscriptions/types';

import SharpSVG from '@/assets/icons/sharp.svg';
import dayjs from 'dayjs';
import { URL_CONFIG } from '@/constants';
import { useAccount, useChainId } from 'wagmi';
import { LoadingButton } from '@mui/lab';
import BigNumber from 'bignumber.js';
import { useEthersSigner } from '@/hooks/useEthersSigner';
import { useEthersProvider } from '@/hooks/useEthersProvider';
import { toastResult } from './LaunchpadDialog.tsx/ResultViewHoc';
import ProgressBar from './ProgressBar';

// 自定义样式：灰色小标签（左侧的字段名，如 "Total Supply"）
const Label = styled(Typography)(() => ({
  color: 'rgba(255, 255, 255, 0.65)',
  fontSize: '14px',
  lineHeight: '20px',
}));

// 自定义样式：数据行（标签 + 值，水平排列；移动端改为垂直排列）
const Row = styled((props: BoxProps) => (
  <Box
    {...props}
    sx={{
      flexDirection: { xs: 'column', sm: 'row' }, // 移动端纵向，桌面端横向
      alignItems: { xs: 'start', sm: 'center' },
      ...props.sx,
    }}
  />
))(() => ({
  display: 'flex',
  justifyContent: 'space-between',
  color: '#FFF',
  fontSize: '14px',
  padding: '8px 0',
}));

interface ITokenOverview {
  p: string;
  tick: string;
  ca?: string;
}

const ERC20SPROTOCOL = 'erc--20'; // erc-20s 协议标识（注意是两个横杠）

const TokenOverview: React.FC<ITokenOverview> = ({ p, tick, ca }) => {
  const [erc20Info, setErc20Info] = useState<GetErc20InfoItem>(); // Token 基本信息
  const singer = useEthersSigner(); // 签名者（用于发送交易）
  const provider = useEthersProvider(); // 提供者（用于读取链上数据）
  const { address } = useAccount(); // 当前连接的钱包地址
  const [erc20sMinted, setMinted] = useState(0); // erc-20s 链上实时铸造数量
  // isErc20S：是否是 erc-20s 协议（带合约地址的升级版）
  const isErc20S = useMemo(() => p === ERC20SPROTOCOL && ca, [p, ca]);
  const [isWaiting, setIsWaiting] = useState(false); // 是否处于 blockInterval 等待期
  // minted：当前已铸造数量（erc-20s 从链上读，普通 erc-20 从 API 读）
  const minted = useMemo(() => {
    if (isErc20S) return erc20sMinted;
    return Number(erc20Info?.minted || 0);
  }, [isErc20S, erc20Info, erc20sMinted]);
  const chainId = useChainId();
  const [userInscribeCount, setUserInscribeCount] = useState<string>('0'); // 用户已铸造次数
  // userAvailableCount：用户还能铸造几次（walletLimit / limitPerMint）
  // 若 walletLimit=0 表示无限制，返回 'unlimit'
  const userAvailableCount = useMemo(() => {
    if (erc20Info?.erc20s?.walletLimit && erc20Info.limitPerMint) {
      if (erc20Info.erc20s.walletLimit === '0') return 'unlimit';
      return Math.floor(Number(erc20Info.erc20s.walletLimit) / Number(erc20Info.limitPerMint)).toString();
    }
    return '';
  }, [erc20Info]);
  const [isSumbit, setIsSubmit] = useState<boolean>(false); // 交易提交中（防重复点击）

  // 从链上读取用户上次 mint 的区块号，计算是否仍在 blockInterval 冷却期
  const getlLastInscribeBlock = async () => {
    if (address && erc20Info && isErc20S) {
      const lastBlock = await evmService.erc20Ethscriptions.getlLastInscribeBlock({
        provider,
        contractAddress: erc20Info.erc20s.contractAddress,
        userAddress: address,
      });
      const cur = await provider.getBlockNumber(); // 当前链上最新区块
      // 若间隔不足 blockInterval 个区块，则还在等待期
      setIsWaiting(cur - lastBlock <= Number(erc20Info.erc20s.blockInterval));
    }
  };
  // Effect #1：组件挂载时获取 Token 基本信息
  useEffect(() => {
    getErc20Info();
  }, []);
  // Effect #2：钱包地址或 erc20Info 变化时，读取链上用户数据（仅 erc-20s）
  useEffect(() => {
    if (address && erc20Info?.erc20s) {
      getInscribeCount();
      getlLastInscribeBlock();
    }
  }, [address, erc20Info]);
  // Effect #3：erc20Info 和 isErc20S 变化时，从合约读取全局已铸造数量
  useEffect(() => {
    if (erc20Info && isErc20S) {
      getMintedInfo();
    }
  }, [erc20Info, isErc20S]);
  // 从 API 获取 Token 基本信息（erc-20s 需要带 ca 参数）
  async function getErc20Info() {
    const params = ca ? { p, tick, ca } : { p, tick };
    const response = await services.ethscriptions.getErc20Info(params);

    if (response?.code == 200) {
      setErc20Info(response.data.info);
    }
  }

  // 从链上合约读取用户已铸造次数（erc-20s 专属）
  async function getInscribeCount() {
    if (address && erc20Info && isErc20S) {
      const userInscribeCount = await evmService.erc20Ethscriptions.getInscribeCount({
        provider,
        contractAddress: erc20Info.erc20s.contractAddress,
        userAddress: address,
      });
      setUserInscribeCount(userInscribeCount.toString());
    }
  }

  // 从链上合约读取全局已铸造数量（erc-20s 的 minted 存储在合约里）
  async function getMintedInfo() {
    if (erc20Info && isErc20S) {
      const minted = await evmService.erc20Ethscriptions.getMintedCount({
        provider,
        contractAddress: erc20Info.erc20s.contractAddress,
      });
      setMinted(minted);
    }
  }

  // ethscribe：铸造入口，根据 isErc20S 分两路执行
  async function ethscribe() {
    if (isErc20S) {
      erc20sEthscribe(); // erc-20s：直接调链上合约
    } else {
      handleGetEthscribe(); // 普通 erc-20：先从后端获取铭文数据再铸造
    }
  }

  // 普通 erc-20 铸造流程：
  //   1. 获取 nonce（terc-20 协议需要特定 nonce）
  //   2. 调后端 API 获取铭文数据（getEthscribe）
  //   3. 调链上服务发送 Ethscription 交易
  async function handleGetEthscribe() {
    try {
      setIsSubmit(true);

      let nonce;

      if (p == 'terc-20') {
        // terc-20 协议要求用当前交易 nonce 防止重放
        nonce = await singer?.getTransactionCount();

        if (!nonce) {
          return;
        }
      }

      const response = await services.ethscriptions.getEthscribe({ p, tick, nonce: nonce });

      if (response?.code == 200) {
        // 调链上服务，发送 Ethscription 铸造交易
        await evmService.etchMarket.inscribeEthscription({ singer: singer!, data: response.data.data });
      }
    } catch (error) {
    } finally {
      setIsSubmit(false);
    }
  }

  // erc-20s 铸造流程：
  //   直接调用链上合约（evmService.erc20Ethscriptions.ethscribe）
  //   成功后刷新：已铸造次数 + blockInterval 等待状态
  async function erc20sEthscribe() {
    if (singer && ca) {
      try {
        setIsSubmit(true);
        const receipt = await evmService.erc20Ethscriptions.ethscribe({ singer, address: ca });
        // toastResult：显示交易结果弹窗（区块链浏览器链接 + 状态）
        toastResult({
          receipt,
          chainId,
          type: 'success',
        });
        getInscribeCount(); // 刷新已铸造次数
        getlLastInscribeBlock(); // 刷新冷却状态
      } catch (error) {
      } finally {
        setIsSubmit(false);
      }
    }
  }

  return (
    <>
      {/* 铸造进度条：minted/totalSupply 转换为百分比，最大不超过 100% */}
      <Box display={'flex'} alignItems={'center'} mb="10px" gap={'10px'}>
        <ProgressBar
          sx={{ width: '50%', height: '8px', flex: 1 }}
          variant="determinate"
          value={Math.min((minted * 100) / Number(erc20Info?.totalSupply), 100)}
        />
        <Typography sx={{ color: 'white' }}>{((minted * 100) / Number(erc20Info?.totalSupply)).toFixed(2)}%</Typography>
      </Box>
      {/* 详情卡片 */}
      <Box sx={{ borderRadius: '12px', border: '1px solid #2F343E', background: '#202229' }}>
        <Box
          sx={{
            padding: '20px 40px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            border: '1px solid #2F343E',
          }}
        >
          <Typography
            sx={{
              color: '#FFF',
              fontSize: '18px',
              fontWeight: 500,
            }}
          >
            Overview
          </Typography>
          {/* erc-20s：右侧显示 "已铸造次数/可铸造总次数" + Ethscribe 按钮 */}
          {isErc20S ? (
            <Box display={'flex'} alignItems={'center'}>
              {/* 计数格式：userInscribeCount / userAvailableCount，如 "3/10" */}
              <Box sx={{ fontSize: '14px', color: 'rgba(255,255,255,0.65)', mr: '8px' }}>
                {userInscribeCount}/{userAvailableCount}
              </Box>
              <LoadingButton
                variant="contained"
                disableElevation
                loading={isSumbit}
                disabled={
                  // 三种禁用条件：全部铸造完 / 用户达到上限 / 仍在 blockInterval 冷却期
                  Number(erc20Info?.minted) >= Number(erc20Info?.totalSupply) ||
                  Number(userInscribeCount) >= Number(userAvailableCount) ||
                  isWaiting
                }
                color="primary"
                sx={{
                  height: '40px',
                  fontSize: '14px',
                  fontWeight: 500,
                  textTransform: 'capitalize',
                  '&.Mui-disabled': {
                    background: '#e5ff6566', // 禁用状态：半透明主题色
                  },
                }}
                onClick={ethscribe}
              >
                {/* 冷却期显示 'Waiting...'，否则显示 'Ethscribe' */}
                {isWaiting ? 'Waiting...' : 'Ethscribe'}
              </LoadingButton>
            </Box>
          ) : (
            // 普通 erc-20：只有铸造完才禁用（用 BigNumber 精确比较大数）
            <LoadingButton
              variant="contained"
              disableElevation
              loading={isSumbit}
              disabled={BigNumber(erc20Info?.minted || 0).gte(erc20Info?.totalSupply || 0)}
              color="primary"
              sx={{
                height: '40px',
                fontSize: '14px',
                fontWeight: 500,
                textTransform: 'capitalize',
                '&.Mui-disabled': {
                  background: '#e5ff6566',
                },
              }}
              onClick={ethscribe}
            >
              Ethscribe
            </LoadingButton>
          )}
        </Box>
        <Box
          sx={{
            padding: '20px 40px 32px',
          }}
        >
          <Row>
            <Label>Ethscription ID</Label>
            {/* 点击 ID → 新标签打开 Ethscription 浏览器 */}
            <Link
              href={`${URL_CONFIG[chainId].etherscription}/ethscriptions/${erc20Info?.ethscriptionId}`}
              sx={{ display: 'flex', alignItems: 'center', color: '#fff', lineHeight: '20px', cursor: 'pointer' }}
              target="_blank"
            >
              <Typography sx={{ textDecorationLine: 'underline', wordBreak: 'break-word' }}>
                {erc20Info?.ethscriptionId ?? ''}
                <SharpSVG color="rgba(255,255,255,0.45)" style={{ marginLeft: '4px' }} />
              </Typography>
            </Link>
          </Row>
          {/* 合约地址（仅 erc-20s 有，链接到区块链浏览器）*/}
          {erc20Info?.erc20s?.contractAddress && (
            <Row>
              <Label>Contract Address</Label>
              <Link
                href={`${URL_CONFIG[chainId].etherScanUrl}/address/${erc20Info?.erc20s?.contractAddress}`}
                sx={{ display: 'flex', alignItems: 'center', color: '#fff', lineHeight: '20px', cursor: 'pointer' }}
                target="_blank"
              >
                <Typography sx={{ textDecorationLine: 'underline', wordBreak: 'break-word' }}>
                  {erc20Info?.erc20s?.contractAddress}
                  <SharpSVG color="rgba(255,255,255,0.45)" style={{ marginLeft: '4px' }} />
                </Typography>
              </Link>
            </Row>
          )}
          <Row>
            <Label>Total Supply</Label>
            <Box>{Number(erc20Info?.totalSupply ?? 0).toLocaleString()}</Box>
          </Row>
          <Row>
            <Label>Minted</Label>
            <Box>{Number(erc20Info?.minted ?? 0).toLocaleString()}</Box>
          </Row>
          <Row>
            <Label>Limit per mint</Label>
            <Box>{Number(erc20Info?.limitPerMint ?? 0).toLocaleString()}</Box>
          </Row>
          {erc20Info?.erc20s?.walletLimit && (
            <Row>
              <Label>Wallet Limit</Label>
              <Box>{erc20Info?.erc20s.walletLimit}</Box>
            </Row>
          )}
          {erc20Info?.erc20s?.blockInterval && (
            <Row>
              <Label>Mint Interval</Label>
              <Box>{erc20Info?.erc20s?.blockInterval} blocks</Box>
            </Row>
          )}
          <Row>
            <Label>Decimal</Label>
            <Box>{erc20Info?.decimal}</Box>
          </Row>
          <Row>
            <Label>Deploy By</Label>
            {/* isErc20S 时显示合约部署者地址（deployer），否则显示铭文创建者（creator）*/}
            <Link
              href={`${URL_CONFIG[chainId].etherScanUrl}/address/${
                isErc20S ? erc20Info?.erc20s?.deployer : erc20Info?.creator
              }`}
              sx={{ display: 'flex', alignItems: 'center', color: '#fff', lineHeight: '20px', cursor: 'pointer' }}
              target="_blank"
            >
              <Typography sx={{ textDecorationLine: 'underline', wordBreak: 'break-word' }}>
                {isErc20S ? erc20Info?.erc20s?.deployer : erc20Info?.creator}
                <SharpSVG color="rgba(255,255,255,0.45)" style={{ marginLeft: '4px' }} />
              </Typography>
            </Link>
          </Row>
          <Row>
            <Label>Deploy Time</Label>
            <Box>{dayjs(erc20Info?.deployTime).format('YYYY/MM/DD HH:mm:ss')}</Box>
          </Row>
          {erc20Info?.erc20s?.startTime && (
            <Row>
              <Label>Start Time</Label>
              <Box>{dayjs(Number(erc20Info?.erc20s?.startTime) * 1000).format('YYYY/MM/DD HH:mm:ss')}</Box>
            </Row>
          )}
          {/* royalty 单位是 1/100，除以 100 得到百分比（如 1000 → 10%）*/}
          {erc20Info?.erc20s?.royalty && (
            <Row>
              <Label>Rayalty</Label>
              <Box>{(Number(erc20Info.erc20s.royalty) / 100).toFixed(0)}%</Box>
            </Row>
          )}
          {erc20Info?.erc20s?.royaltyReceiver && (
            <Row>
              <Label>Royalty Receiver</Label>
              <Link
                href={`${URL_CONFIG[chainId].etherScanUrl}/address/${erc20Info?.erc20s?.royaltyReceiver}`}
                sx={{ display: 'flex', alignItems: 'center', color: '#fff', lineHeight: '20px', cursor: 'pointer' }}
                target="_blank"
              >
                <Typography sx={{ textDecorationLine: 'underline', wordBreak: 'break-word' }}>
                  {erc20Info?.erc20s?.royaltyReceiver}
                  <SharpSVG color="rgba(255,255,255,0.45)" style={{ marginLeft: '4px' }} />
                </Typography>
              </Link>
            </Row>
          )}
          <Row>
            <Label>Holders</Label>
            <Box>{erc20Info?.holders ?? 0}</Box>
          </Row>
          <Row>
            <Label>Total Transactions</Label>
            <Box>{Number(erc20Info?.transactions ?? 0).toLocaleString()}</Box>
          </Row>
        </Box>
      </Box>
    </>
  );
};

export default TokenOverview;
