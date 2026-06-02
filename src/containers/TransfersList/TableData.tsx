// ============================================================================
// 【TransfersList/TableData.tsx】转账记录 DataGrid 表格
// ----------------------------------------------------------------------------
// 列定义：
//   id（铭文序号）→ 外链到 ethscription 浏览器（URL_CONFIG[chainId].etherscription）
//   method       → mint/transfer/burn 等操作类型
//   amount       → 转账数量
//   from / to    → 发送/接收地址（formatAddress 截断为 0x12...6789）
//   blockTime    → 区块时间（dayjs 格式化）
//
// 注意：renderCell 中调用了 useChainId()，这是在列渲染函数里使用 Hook，
// 这在 React 规范中是不推荐的（Hook 应只在组件顶层调用），
// 但因为 DataGrid renderCell 本质上是 React 组件，所以可以运行。
// ============================================================================
import dayjs from 'dayjs';
import { Box, CircularProgress, Link, Pagination, Typography } from '@mui/material';
import { useRouter } from 'next/navigation';
import { DataGrid, GridColDef, GridPaginationModel, GridRenderCellParams } from '@mui/x-data-grid';

import { GetTransfersInfoData, GetTransfersItem } from '@/services/ethscriptions/types';
import SharpSVG from '@/assets/icons/sharp.svg';
import { formatAddress } from '@/utils/addressHelper';
import { URL_CONFIG } from '@/constants';
import { useChainId } from 'wagmi';

const columns = (data: GetTransfersInfoData): GridColDef<GetTransfersItem>[] => {
  return [
    {
      field: 'id',
      headerName: 'Ethscription Number',
      type: 'string',
      sortable: false,
      filterable: false,
      width: 180,
      headerAlign: 'left',
      align: 'left',
      renderCell: (item: GridRenderCellParams<GetTransfersItem>) => {
        const chainId = useChainId();
        const _url = `${URL_CONFIG[chainId].etherscription}/ethscriptions/${item.row?.ethscriptionId}`;
        return (
          <Box display={'flex'}>
            <Link
              href={_url}
              sx={{
                display: 'flex',
                textDecoration: 'none',
                alignItems: 'center',
                color: '#fff',
                lineHeight: '20px',
                cursor: 'pointer',
              }}
              target="_blank"
            >
              <Typography
                sx={{
                  color: 'rgba(255, 255, 255, 0.45)',
                  fontSize: '14px',
                  fontWeight: 500,
                  '&:hover': {
                    color: 'white',
                  },
                }}
              >{`#${item.row.id}`}</Typography>
              <SharpSVG color="rgba(255,255,255,0.45)" style={{ marginLeft: '4px' }} />
            </Link>
          </Box>
        );
      },
    },
    {
      field: 'txHash',
      headerName: 'Method',
      editable: false,
      type: 'string',
      headerAlign: 'left',
      sortable: false,
      filterable: false,
      width: 125,
      renderCell: (item: GridRenderCellParams<GetTransfersItem>) => {
        return <Box>{item.row.method}</Box>;
      },
    },
    {
      field: 'amount',
      headerName: 'Quantity',
      editable: false,
      type: 'string',
      headerAlign: 'left',
      sortable: false,
      filterable: false,
      width: 175,
      renderCell: (item: GridRenderCellParams<GetTransfersItem>) => {
        return (
          <Typography
            sx={{
              color: '#FFF',
              fontWeight: 500,
              fontSize: '14px',
              marginBottom: '8px',
            }}
          >
            {item.row.amount}
          </Typography>
        );
      },
    },
    {
      field: 'from',
      headerName: 'From',
      editable: false,
      type: 'number',
      headerAlign: 'left',
      align: 'left',
      sortable: false,
      filterable: false,
      width: 190,
      renderCell: (item: GridRenderCellParams<GetTransfersItem>) => {
        return (
          <Box
            sx={{
              color: 'rgba(255, 255, 255, 0.45)',
              fontSize: '14px',
              fontWeight: 500,
              textDecoration: 'underline',
            }}
          >
            {formatAddress(item.row.from)}
          </Box>
        );
      },
    },
    {
      field: 'to',
      headerName: 'To',
      editable: false,
      type: 'number',
      headerAlign: 'left',
      align: 'left',
      sortable: false,
      filterable: false,
      width: 190,
      renderCell: (item: GridRenderCellParams<GetTransfersItem>) => {
        return (
          <Box
            sx={{
              color: 'rgba(255, 255, 255, 0.45)',
              fontSize: '14px',
              fontWeight: 500,
              textDecoration: 'underline',
            }}
          >
            {formatAddress(item.row.to)}
          </Box>
        );
      },
    },
    {
      field: 'blockTime',
      headerName: 'Date Time',
      editable: false,
      type: 'number',
      headerAlign: 'right',
      align: 'right',
      sortable: false,
      filterable: false,
      width: 200,
      renderCell: (item: GridRenderCellParams<GetTransfersItem>) => {
        const chainId = useChainId();
        return (
          <Link
            href={`${URL_CONFIG[chainId].etherScanUrl}/tx/${item.row?.txHash}`}
            sx={{
              display: 'flex',
              textDecoration: 'none',
              alignItems: 'center',
              color: '#fff',
              lineHeight: '20px',
              cursor: 'pointer',
            }}
            target="_blank"
          >
            <Typography width={'165px'}>{dayjs(item.row.blockTime).format('YYYY/MM/DD HH:mm:ss')}</Typography>
            <SharpSVG color="rgba(255,255,255,0.45)" />
          </Link>
        );
      },
    },
  ];
};

interface ITxListTable {
  data: GetTransfersInfoData;
  pageSize: number;
  onPageChange: (model: GridPaginationModel) => void;
  isLoading: boolean;
}

const TableData = ({ data, pageSize = 10, isLoading, onPageChange }: ITxListTable) => {
  const router = useRouter();

  const handleOnPage = async (model: GridPaginationModel) => {
    await onPageChange(model);
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ marginBottom: '40px' }}>
        <DataGrid
          disableColumnMenu
          getRowId={(item: GetTransfersItem) =>
            Symbol(`${item.ethscriptionId}-${item.blockNumber}-${item.from}-${item.txHash}`).toString()
          }
          columnHeaderHeight={36}
          rowHeight={64}
          rows={data.transfer ?? []}
          columns={columns(data)}
          keepNonExistentRowsSelected={false}
          rowCount={2}
          loading={isLoading}
          paginationMode="server"
          checkboxSelection={false}
          autoHeight
          disableRowSelectionOnClick
          slots={{
            noRowsOverlay: () => (
              <Box display="flex" alignItems="center" justifyContent="center" height="100%">
                No Data
              </Box>
            ),
            loadingOverlay: () => (
              <Box display="flex" alignItems="center" justifyContent="center" height="100%">
                <CircularProgress sx={{ color: 'rgba(255,255,255,0.2)' }} />
              </Box>
            ),
            footer: () => null,
          }}
          sx={{
            color: '#fff',
            border: 'none',
            borderRadius: '0',
            overflow: 'hidden',

            '.MuiDataGrid-columnHeader:focus-within': {
              border: 'none',
              outline: 'none',
            },
            '.MuiDataGrid-columnHeader:focus': {
              border: 'none',
              outline: 'none',
            },
            '.MuiDataGrid-columnHeaders': {
              background: 'transparent',
              border: 'none',
              height: '36px',
              borderRadius: 0,
              paddingLeft: 0,
              paddingRight: 0,
              fontSize: '14px',
              color: 'rgba(255, 255, 255, 0.60)',
              fontWeight: 500,
              '.MuiDataGrid-columnSeparator': {
                display: 'none',
              },
              '.MuiDataGrid-columnHeader': {
                padding: 0,
              },
            },
            '& .MuiDataGrid-row': {
              cursor: 'pointer',
              borderBottom: '1px solid #2F343E',
              padding: 0,
              boxSizing: 'border-box',
              '&:hover, &.Mui-selected, &.Mui-selected:hover': {
                backgroundColor: 'rgba(255,255,255,0.03)',
              },
              '& .MuiDataGrid-cell': {
                borderBottom: 'none',
                padding: 0,
                '&:focus-within, &:focus': {
                  border: 'none',
                  outline: 'none',
                },
              },
            },
          }}
        />
      </Box>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          width: '100%',
        }}
      >
        {Math.ceil(Number(data.page.total) / pageSize) > 1 && (
          <Pagination
            sx={{
              '&.MuiPagination-outlined': {
                '.MuiPagination-ul': {
                  gap: '16px',
                  justifyContent: 'space-between',
                  '.MuiPaginationItem-root': {
                    color: '#fff',
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 255, 255, 0.05)',
                    borderRadius: '8px',
                    height: '40px',
                    width: '40px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0',
                  },
                  '.Mui-selected': {
                    border: '1px solid rgba(229, 255, 101, 1)',
                  },
                },
              },
            }}
            size="small"
            count={Math.ceil(Number(data.page.total) / pageSize)}
            variant="outlined"
            shape="rounded"
            onChange={async (event, page) => {
              await handleOnPage({ page, pageSize });
            }}
          />
        )}
      </Box>
    </Box>
  );
};

export default TableData;
