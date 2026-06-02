// ============================================================================
// 【HoldersList/TableData.tsx】持有者列表 DataGrid 表格
// ----------------------------------------------------------------------------
// MUI DataGrid 服务端分页表格，列说明：
//   rank       = 排名
//   holder     = 地址（截断 + 链接至 /tokens/search 查询该地址持有情况）
//   percentage = 持有占比（quantity/totalSupply × 100）+ ProgressBar 进度条
//   quantity   = 持有数量（toLocaleString 加千分位）
//
// DataGrid 关键配置：
//   paginationMode="server" → 分页由后端控制，前端只传 page.index/page.size
//   getRowId                → Symbol(holder) 生成唯一行 ID
//   footer: () => null      → 隐藏默认 Footer（使用外部自定义分页）
//   rowHeight={64}          → 行高 64px（percentage 列含进度条需要更多空间）
// ============================================================================
import dayjs from 'dayjs';
import BigNumber from 'bignumber.js';
import { Box, CircularProgress, Link, Pagination, Typography } from '@mui/material';
import { useRouter } from 'next/navigation';
import { DataGrid, GridColDef, GridPaginationModel, GridRenderCellParams, GridRowParams } from '@mui/x-data-grid';

import ProgressBar from '@/containers/ProgressBar';
import { GetHoldersInfoData, GetHoldersItem } from '@/services/ethscriptions/types';
import SharpSVG from '@/assets/icons/sharp.svg';

interface ITxListTable {
  p: string;
  tick: string;
  data: GetHoldersInfoData;
  pageSize: number;
  onPageChange: (model: GridPaginationModel) => void;
  isLoading: boolean;
}

const TableData = ({ data, pageSize = 10, isLoading, onPageChange, tick, p }: ITxListTable) => {
  const router = useRouter();
  const columns = (data: GetHoldersInfoData): GridColDef<GetHoldersItem>[] => {
    return [
      {
        field: 'rank',
        headerName: 'Rank',
        type: 'string',
        sortable: false,
        filterable: false,
        minWidth: 80,
        flex: 1,
        headerAlign: 'left',
        align: 'left',
        renderCell: (item: GridRenderCellParams<GetHoldersItem>) => {
          return item.row.rank;
        },
      },
      {
        field: 'holder',
        headerName: 'Address',
        editable: false,
        type: 'string',
        headerAlign: 'left',
        minWidth: 180,
        sortable: false,
        filterable: false,
        flex: 1,
        renderCell: (item: GridRenderCellParams<GetHoldersItem>) => {
          return (
            <Box>
              <Link
                href={`/tokens/search?address=${item.row.holder}&collection=${p} ${tick}`}
                sx={{ display: 'flex', alignItems: 'center', color: '#fff', lineHeight: '20px', cursor: 'pointer' }}
                target="_blank"
              >
                <Typography sx={{ textDecorationLine: 'underline' }}>{`${item.row.holder.slice(
                  0,
                  6,
                )}...${item.row.holder.slice(-6)}`}</Typography>
                <SharpSVG color="rgba(255,255,255,0.45)" style={{ marginLeft: '4px' }} />
              </Link>
            </Box>
          );
        },
      },
      {
        field: 'percentage',
        headerName: 'Percentage',
        editable: false,
        type: 'string',
        headerAlign: 'left',
        sortable: false,
        minWidth: 220,
        filterable: false,
        flex: 1,
        renderCell: (item: GridRenderCellParams<GetHoldersItem>) => {
          const value = new BigNumber(item.row.quantity).div(data.totalSupply).multipliedBy(100);
          return (
            <Box>
              <Typography
                sx={{
                  color: '#FFF',
                  fontWeight: 500,
                  fontSize: '14px',
                  marginBottom: '8px',
                }}
              >
                {`${value.toFixed(2)}%`}
              </Typography>
              <ProgressBar sx={{ width: '200px', height: '6px' }} variant="determinate" value={value.toNumber()} />
            </Box>
          );
        },
      },
      {
        field: 'quantity',
        headerName: 'Value',
        editable: false,
        type: 'number',
        headerAlign: 'left',
        align: 'left',
        sortable: false,
        filterable: false,
        minWidth: 150,
        flex: 1,
        renderCell: (item: GridRenderCellParams<GetHoldersItem>) => {
          return Number(item.row.quantity).toLocaleString();
        },
      },
    ];
  };
  const handleOnPage = async (model: GridPaginationModel) => {
    await onPageChange(model);
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ marginBottom: '40px' }}>
        <DataGrid
          disableColumnMenu
          getRowId={(item: GetHoldersItem) => Symbol(item.holder).toString()}
          columnHeaderHeight={36}
          rowHeight={64}
          rows={data.holders ?? []}
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
