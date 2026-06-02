import dayjs from 'dayjs';
import BigNumber from 'bignumber.js';
import { Box, CircularProgress, Pagination, Typography } from '@mui/material';
import { DataGrid, GridColDef, GridPaginationModel, GridRenderCellParams, GridRowParams } from '@mui/x-data-grid';

import ProgressBar from '@/containers/ProgressBar';
import { GetErc20ListData, GetErc20Item } from '@/services/ethscriptions/types';
import ArrowRightSVG from '@/assets/icons/arrow_right.svg';
import { useRouter } from 'next/navigation';
import { getQueryParams } from '@/services/getQueryParams';
import EthscriptionLabel from '@/components/EthscriptionLabel';
import { getTimeAgoString } from '@/utils';

const columns: GridColDef[] = [
  {
    field: 'token',
    headerName: 'Token',
    type: 'string',
    sortable: false,
    filterable: false,
    width: 212,
    headerAlign: 'left',
    align: 'left',
    renderCell: (item: GridRenderCellParams<GetErc20Item>) => {
      return <EthscriptionLabel collectionName={`${item.row.protocol} ${item.row.tick}`} category="token" icon="" />;
    },
  },
  {
    field: 'deploy',
    headerName: 'Deploy Time',
    editable: false,
    type: 'string',
    headerAlign: 'left',
    sortable: false,
    filterable: false,
    width: 212,
    renderCell: (item: GridRenderCellParams<GetErc20Item>) => {
      return <Box>{getTimeAgoString(item.row.deployTime)}</Box>;
    },
  },
  {
    field: 'state',
    headerName: 'Progress',
    editable: false,
    type: 'string',
    headerAlign: 'left',
    sortable: false,
    filterable: false,
    width: 212,
    renderCell: (item: GridRenderCellParams<GetErc20Item>) => {
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
    align: 'left',
    sortable: false,
    filterable: false,
    width: 212,
    renderCell: (item: GridRenderCellParams<GetErc20Item>) => {
      return Number(item.row.holders).toLocaleString();
    },
  },
  {
    field: 'transactions',
    headerName: 'Transactions',
    editable: false,
    type: 'number',
    headerAlign: 'left',
    align: 'left',
    sortable: false,
    filterable: false,
    width: 212,
    renderCell: (item: GridRenderCellParams<GetErc20Item>) => {
      return Number(item.row.transactions).toLocaleString();
    },
  },
  {
    field: 'actions',
    type: 'actions',
    width: 16,
    maxWidth: 16,
    minWidth: 16,
    align: 'right',
    renderCell: () => {
      return <ArrowRightSVG color="rgba(255,255,255,0.45)" />;
    },
  },
];

interface ITxListTable {
  data: GetErc20ListData;
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
          getRowId={(item: GetErc20Item) => Symbol(item.chainName + item.deployTime + item.tick).toString()}
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
          onRowClick={(item: GridRowParams<GetErc20Item>) => {
            router.push(`/tokens/info?${getQueryParams({ p: item.row.protocol, tick: item.row.tick })}`);
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
