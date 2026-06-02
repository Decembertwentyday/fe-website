// ============================================================================
// 【Deposit】Bridge 跨链存入表单（Ethereum → Facet）
// ----------------------------------------------------------------------------
// 职责：
//   提供用户将 ETH 从以太坊主网存入 Facet L2 的操作表单。
//
// ⚠️ 注意：此组件目前是未完成状态（开发中）
//   onSubmit 函数体内只有 `// 提交` 注释，说明实际的跨链逻辑尚未实现。
//   这是一个占位组件，展示了 UI 骨架和表单结构。
//
// 表单管理方案：react-hook-form
//   - useForm：创建表单实例，管理字段值、验证状态、提交状态
//   - Controller：将受控组件（NumericFormat）接入 react-hook-form 的控制体系
//   - ErrorMessage：读取 formState.errors，显示字段验证错误
//   - handleSubmit：拦截原生 form submit，自动进行 validate → onSubmit 流程
//
// 为什么要用 Controller + NumericFormat 组合？
//   NumericFormat 是第三方组件，不能直接用 react-hook-form 的 register()。
//   Controller 提供 render prop 模式，把 react-hook-form 的 field（onChange/value/ref）
//   手动注入到 NumericFormat 的 onValueChange 回调中，实现双向绑定。
//
// 验证规则（rules）：
//   - required: true → 不能为空
//   - max: { value: 100, message: 'Invalid balance' } → 最大 100（暂时硬编码，非真实余额校验）
// ============================================================================

import { Box, InputAdornment, OutlinedInput, Stack, Typography } from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { NumericFormat } from 'react-number-format';
import toast from 'react-hot-toast';
import { Controller, useForm } from 'react-hook-form';
import { ErrorMessage } from '@hookform/error-message';

import ChainEthSVG from '@/assets/icons/chain_eth.svg';
import ChainFacetSVG from '@/assets/icons/chain_facet.svg';
import ArrowRightSVG from '@/assets/icons/arrow_right.svg';
import ChainItem from './ChainItem';
import WarnSVG from '@/assets/icons/warn32.svg';
import { useEthersSigner } from '@/hooks/useEthersSigner';
import { useAccount } from 'wagmi';

// 表单字段类型定义（当前只有一个输入字段：金额）
interface IFormValues {
  amount: string;
}

interface IDeposit {}

const Deposit: React.FC<IDeposit> = () => {
  const singer = useEthersSigner(); // 钱包签名者（发送跨链交易用）
  const { address } = useAccount(); // 当前连接的钱包地址

  // 初始化 react-hook-form
  // handleSubmit：包裹提交处理函数，自动触发验证
  // control：传给 Controller 用于注册受控字段
  // formState：包含 errors（验证错误）、isSubmitting（是否正在提交）、isValid（是否通过验证）
  // reset：重置表单到初始值
  // trigger：手动触发某字段的验证（在 onValueChange 里手动调用，实时校验输入）
  const { handleSubmit, control, formState, reset, watch, setError, clearErrors, trigger } = useForm<IFormValues>({
    defaultValues: {
      amount: '', // 初始金额为空字符串
    },
  });

  // ★ 表单提交处理（⚠️ 功能未实现，仅占位）
  async function onSubmit() {
    try {
      if (singer) {
        // 提交（跨链存入逻辑待开发）
      }
      reset(); // 提交后清空表单
    } catch (error) {
      // 失败时显示错误 toast（错误 UI 已实现，业务逻辑未实现）
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
    }
  }

  return (
    <Box
      sx={{
        width: '394px',
        borderRadius: '12px',
        border: '1px solid #2F343E',
        background: '#202229',
        boxShadow: '0px 0px 4px 0px rgba(19, 33, 82, 0.06), 0px 1px 25px 0px rgba(19, 33, 82, 0.10)',
        p: '46px 24px 77px',
        boxSizing: 'border-box',
      }}
    >
      {/* 顶部：展示跨链方向 Ethereum → Facet */}
      <Stack direction="row" alignItems="center" gap="24px" mb="46px">
        <ChainItem type="From" name="Ethereum" icon={<ChainEthSVG />} />
        <ArrowRightSVG />
        <ChainItem type="To" name="Facet" icon={<ChainFacetSVG />} />
      </Stack>

      <Typography sx={{ fontSize: '14px', color: '#FFF', mb: '4px' }}>Amount</Typography>

      {/* react-hook-form 的 form 元素，onSubmit 由 handleSubmit 包裹以自动触发验证 */}
      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Controller：把 NumericFormat 接入 react-hook-form 管理体系 */}
        <Controller
          name="amount" // 对应 IFormValues 的 amount 字段
          control={control} // 来自 useForm()
          rules={{
            required: true, // 不能为空
            max: {
              value: 100, // 最大值 100（暂硬编码，生产应使用真实余额）
              message: 'Invalid balance',
            },
          }}
          render={({ field }) => {
            // 解构 field：把 onChange 单独取出，其余属性扩展给 NumericFormat
            const { onChange, ...fieldProps } = field;
            return (
              <NumericFormat
                {...fieldProps} // 注入 value/name/ref/onBlur
                autoComplete="off"
                customInput={OutlinedInput}
                allowNegative={false}
                thousandSeparator
                valueIsNumericString
                fullWidth
                decimalScale={6}
                onValueChange={(data) => {
                  // NumericFormat 的 onValueChange 提供 data.value（未格式化的纯数字字符串）
                  // 手动调用 react-hook-form 的 onChange 来更新表单值
                  onChange({
                    target: {
                      name: field.name,
                      value: data.value,
                    },
                  });
                  // 每次值变化时手动触发验证（实时反馈 max 超限错误）
                  trigger('amount');
                }}
                endAdornment={<InputAdornment position="end">MATIC</InputAdornment>}
                sx={{
                  height: '60px',
                  borderRadius: '4px',
                  border: '1px solid rgba(255,255,255,0.2)',
                  '& input': {
                    textAlign: 'right', // 数字右对齐，更符合财务输入框习惯
                  },
                  '&.MuiOutlinedInput-root': {
                    fieldset: {
                      border: 'none', // 去掉 MUI 默认 border，用外层 Box 的 border 统一样式
                    },
                  },
                }}
              />
            );
          }}
        />

        {/* 验证错误提示区（最小高度 18px，无错误时占位避免布局跳动） */}
        <Box minHeight="18px" mb="30px">
          <ErrorMessage
            errors={formState.errors} // react-hook-form 的错误对象
            name="amount"
            render={({ message }) => {
              return <Typography sx={{ fontSize: '12px', color: 'red' }}>{message}</Typography>;
            }}
          />
        </Box>

        {/* 提交按钮
            - loading 跟随 formState.isSubmitting（提交中自动显示 loading）
            - disabled：正在提交 OR 表单未通过验证（isValid=false）
            - type="submit" 触发 form 的 onSubmit */}
        <LoadingButton
          variant="contained"
          fullWidth
          loadingPosition="start"
          disableElevation
          loading={formState.isSubmitting}
          disabled={formState.isSubmitting || !formState.isValid}
          color="primary"
          sx={{
            height: '40px',
            fontSize: '14px',
            fontWeight: 500,
            textTransform: 'capitalize',
            '&.Mui-disabled': {
              background: '#e5ff6566', // 禁用态：半透明黄绿
            },
          }}
          type="submit"
        >
          Deposit
        </LoadingButton>
      </form>
    </Box>
  );
};

export default Deposit;

import ChainEthSVG from '@/assets/icons/chain_eth.svg';
import ChainFacetSVG from '@/assets/icons/chain_facet.svg';
import ArrowRightSVG from '@/assets/icons/arrow_right.svg';
import ChainItem from './ChainItem';
import WarnSVG from '@/assets/icons/warn32.svg';
import { useEthersSigner } from '@/hooks/useEthersSigner';
import { useAccount } from 'wagmi';

interface IFormValues {
  amount: string;
}

interface IDeposit {}

const Deposit: React.FC<IDeposit> = () => {
  const singer = useEthersSigner();
  const { address } = useAccount();
  const { handleSubmit, control, formState, reset, watch, setError, clearErrors, trigger } = useForm<IFormValues>({
    defaultValues: {
      amount: '',
    },
  });

  async function onSubmit() {
    try {
      if (singer) {
        // 提交
      }
      reset();
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
    }
  }

  return (
    <Box
      sx={{
        width: '394px',
        borderRadius: '12px',
        border: '1px solid #2F343E',
        background: '#202229',
        boxShadow: '0px 0px 4px 0px rgba(19, 33, 82, 0.06), 0px 1px 25px 0px rgba(19, 33, 82, 0.10)',
        p: '46px 24px 77px',
        boxSizing: 'border-box',
      }}
    >
      <Stack direction="row" alignItems="center" gap="24px" mb="46px">
        <ChainItem type="From" name="Ethereum" icon={<ChainEthSVG />} />
        <ArrowRightSVG />
        <ChainItem type="To" name="Facet" icon={<ChainFacetSVG />} />
      </Stack>

      <Typography sx={{ fontSize: '14px', color: '#FFF', mb: '4px' }}>Amount</Typography>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Controller
          name="amount"
          control={control}
          rules={{
            required: true,
            max: {
              value: 100,
              message: 'Invalid balance',
            },
          }}
          render={({ field }) => {
            const { onChange, ...fieldProps } = field;
            return (
              <NumericFormat
                {...fieldProps}
                autoComplete="off"
                customInput={OutlinedInput}
                allowNegative={false}
                thousandSeparator
                valueIsNumericString
                fullWidth
                decimalScale={6}
                onValueChange={(data) => {
                  onChange({
                    target: {
                      name: field.name,
                      value: data.value,
                    },
                  });
                  trigger('amount');
                }}
                endAdornment={<InputAdornment position="end">MATIC</InputAdornment>}
                sx={{
                  height: '60px',
                  borderRadius: '4px',
                  border: '1px solid rgba(255,255,255,0.2)',
                  '& input': {
                    textAlign: 'right',
                  },
                  '&.MuiOutlinedInput-root': {
                    fieldset: {
                      border: 'none',
                    },
                  },
                }}
              />
            );
          }}
        />
        <Box minHeight="18px" mb="30px">
          <ErrorMessage
            errors={formState.errors}
            name="amount"
            render={({ message }) => {
              return <Typography sx={{ fontSize: '12px', color: 'red' }}>{message}</Typography>;
            }}
          />
        </Box>
        <LoadingButton
          variant="contained"
          fullWidth
          loadingPosition="start"
          disableElevation
          loading={formState.isSubmitting}
          disabled={formState.isSubmitting || !formState.isValid}
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
          type="submit"
        >
          Deposit
        </LoadingButton>
      </form>
    </Box>
  );
};

export default Deposit;
