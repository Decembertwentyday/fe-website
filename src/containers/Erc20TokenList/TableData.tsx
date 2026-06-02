import dayjs from 'dayjs';
import BigNumber from 'bignumber.js';
import { Box, CircularProgress, Pagination, Typography, Link } from '@mui/material';
import { DataGrid, GridColDef, GridPaginationModel, GridRenderCellParams, GridRowParams } from '@mui/x-data-grid';

import ProgressBar from '@/containers/ProgressBar';
import { GetErc20sItem, GetErc20sListData } from '@/services/ethscriptions/types';
import ArrowRightSVG from '@/assets/icons/arrow_right.svg';
import { useRouter } from 'next/navigation';
import { getQueryParams } from '@/services/getQueryParams';
import { getTimeAgoString } from '@/utils';
import SharpSVG from '@/assets/icons/sharp.svg';

import { URL_CONFIG } from '@/constants';
import { useChainId } from 'wagmi';
import { formatAddress } from '@/utils/addressHelper';
import { formatUnits } from 'ethers/lib/utils';
import getTruncate from '@/utils/getTruncate';

interface ITxListTable {
  data: GetErc20sListData;
  pageSize: number;
  onPageChange: (model: GridPaginationModel) => void;
  isLoading: boolean;
}

const TableData = ({ data, pageSize = 10, isLoading, onPageChange }: ITxListTable) => {
  const router = useRouter();
  const chainId = useChainId();
  const columns: GridColDef[] = [
    {
      field: 'tick',
      headerName: 'Token',
      type: 'string',
      sortable: false,
      filterable: false,
      minWidth: 180,
      headerAlign: 'left',
      flex: 1,
      align: 'left',
      renderCell: (item: GridRenderCellParams<GetErc20sItem>) => {
        return (
          <Box>
            <Typography sx={{ fontWeight: 500 }}>{item.row.erc20s.symbol}</Typography>
            <Typography sx={{ fontSize: '14px', color: 'rgba(255,255,255,0.45)' }}>{item.row.erc20s.name}</Typography>
          </Box>
        );
      },
    },
    {
      field: 'erc20s.contractAddess',
      headerName: 'Contract',
      editable: false,
      type: 'string',
      headerAlign: 'left',
      flex: 1,
      align: 'left',
      sortable: false,
      filterable: false,
      minWidth: 200,
      renderCell: (item: GridRenderCellParams<GetErc20sItem>) => {
        return (
          <Box
            display="flex"
            alignItems="center"
            sx={{
              color: 'white',
              textDecoration: 'none',
              fontSize: '14px',
              fontWeight: 500,
            }}
            onClick={(e) => {
              e.stopPropagation();
              window.open(`${URL_CONFIG[chainId].etherScanUrl}address/${item.row.erc20s.contractAddress}`);
            }}
          >
            <Typography component="span" sx={{ mr: '4px' }}>
              {formatAddress(item.row.erc20s.contractAddress)}
            </Typography>
            <SharpSVG color="rgba(255,255,255,0.45)" />
          </Box>
        );
      },
    },
    {
      field: 'erc20s.walletLimit',
      headerName: 'Wallet Limit',
      editable: false,
      type: 'number',
      headerAlign: 'left',
      flex: 1,
      align: 'left',
      sortable: false,
      filterable: false,
      minWidth: 150,
      renderCell: (item: GridRenderCellParams<GetErc20sItem>) => {
        return getTruncate(item.row.erc20s.walletLimit, 2);
      },
    },
    {
      field: 'erc20s.royalty',
      headerName: 'Royalty',
      editable: false,
      type: 'string',
      headerAlign: 'left',
      flex: 1,
      sortable: false,
      filterable: false,
      minWidth: 120,
      renderCell: (item: GridRenderCellParams<GetErc20sItem>) => {
        return item.row.erc20s.royalty / 100 + '%';
      },
    },
    {
      field: 'deployTime',
      headerName: 'Deploy Time',
      editable: false,
      type: 'string',
      headerAlign: 'left',
      flex: 1,
      sortable: false,
      filterable: false,
      minWidth: 180,
      renderCell: (item: GridRenderCellParams<GetErc20sItem>) => {
        return <Box>{getTimeAgoString(item.row.deployTime)}</Box>;
      },
    },
    {
      field: 'erc20s.startTime',
      headerName: 'Start Time',
      editable: false,
      type: 'string',
      headerAlign: 'left',
      flex: 1,
      sortable: false,
      filterable: false,
      minWidth: 180,
      renderCell: (item: GridRenderCellParams<GetErc20sItem>) => {
        return (
          <Typography fontSize={'14px'} fontWeight={500}>
            {dayjs(Number(item.row.erc20s.startTime) * 1000).format('YYYY/MM/DD HH:mm:ss')}
          </Typography>
        );
      },
    },
    {
      field: 'status',
      headerName: 'Status',
      editable: false,
      type: 'string',
      headerAlign: 'left',
      flex: 1,
      sortable: false,
      filterable: false,
      minWidth: 160,
      renderCell: (item: GridRenderCellParams<GetErc20sItem>) => {
        const now = new Date().valueOf();
        const isUpcoming = now < Number(item.row.erc20s.startTime) * 1000;
        const isActive = !isUpcoming && Number(item.row.minted) < Number(item.row.totalSupply);
        return (
          <Box sx={{ fontSize: '14px', fontWeight: 500 }}>{isUpcoming ? 'Upcoming' : isActive ? 'Active' : 'End'}</Box>
        );
      },
    },
    {
      field: 'minted',
      headerName: 'Progress',
      editable: false,
      type: 'string',
      headerAlign: 'left',
      flex: 1,
      sortable: false,
      filterable: false,
      minWidth: 200,
      renderCell: (item: GridRenderCellParams<GetErc20sItem>) => {
        const value = new BigNumber(item.row.minted).div(item.row.totalSupply).multipliedBy(100);
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
            <ProgressBar sx={{ width: '110px', height: '6px' }} variant="determinate" value={value.toNumber()} />
          </Box>
        );
      },
    },
    {
      field: 'holders',
      headerName: 'Holders',
      editable: false,
      type: 'number',
      headerAlign: 'left',
      flex: 1,
      align: 'left',
      sortable: false,
      filterable: false,
      minWidth: 150,
      renderCell: (item: GridRenderCellParams<GetErc20sItem>) => {
        return Number(item.row.holders).toLocaleString();
      },
    },
    {
      field: 'transactions',
      headerName: 'Transactions',
      editable: false,
      type: 'number',
      headerAlign: 'left',
      flex: 1,
      align: 'left',
      sortable: false,
      filterable: false,
      minWidth: 160,
      renderCell: (item: GridRenderCellParams<GetErc20sItem>) => {
        return Number(item.row.transactions).toLocaleString();
      },
    },
    {
      field: 'actions',
      type: 'actions',
      minWidth: 16,
      maxWidth: 16,
      align: 'right',
      renderCell: () => {
        return <ArrowRightSVG color="rgba(255,255,255,0.45)" />;
      },
    },
  ];
  const handleOnPage = async (model: GridPaginationModel) => {
    await onPageChange(model);
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ marginBottom: '40px' }}>
        <DataGrid
          disableColumnMenu
          getRowId={(item: GetErc20sItem) =>
            Symbol(item.chainName + item.deployTime + item.tick + Math.random()).toString()
          }
          columnHeaderHeight={36}
          rowHeight={64}
          rows={data.ethscriptions ?? []}
          columns={columns}
          keepNonExistentRowsSelected={false}
          rowCount={2}
          loading={isLoading}
          paginationMode="server"
          checkboxSelection={false}
          autoHeight
          disableRowSelectionOnClick={false}
          onRowClick={(item: GridRowParams<GetErc20sItem>) => {
            router.push(
              `/erc20s/info?${getQueryParams({
                p: item.row.protocol,
                tick: item.row.tick,
                ca: item.row.erc20s.contractAddress,
              })}`,
            );
          }}
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
