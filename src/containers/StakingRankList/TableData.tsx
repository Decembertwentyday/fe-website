import BigNumber from 'bignumber.js';
import { Box, CircularProgress, Pagination, Typography } from '@mui/material';
import { DataGrid, GridColDef, GridPaginationModel, GridRenderCellParams, GridRowParams } from '@mui/x-data-grid';

import { useRouter } from 'next/navigation';
import getTruncate from '@/utils/getTruncate';
import { GetStakingRankData, GetStakingRankDataStaker } from '@/services/vault/types';
import { formatAddress } from '@/utils/addressHelper';

const getColumns = (collection: string): GridColDef[] => {
  const columns: GridColDef[] = [
    {
      field: 'staker',
      headerName: 'Staker',
      type: 'string',
      sortable: false,
      filterable: false,
      minWidth: 220,
      flex: 1,
      headerAlign: 'left',
      align: 'left',
      renderCell: (item: GridRenderCellParams<GetStakingRankDataStaker>) => {
        return formatAddress(item.row.staker);
      },
    },
    {
      field: 'staked',
      headerName: `Staked (${collection?.split(' ')[1]})`,
      editable: false,
      type: 'string',
      headerAlign: 'left',
      sortable: false,
      filterable: false,
      minWidth: 180,
      flex: 1,
      renderCell: (item: GridRenderCellParams<GetStakingRankDataStaker>) => {
        return getTruncate(item.row.totalStaked, 6);
      },
    },
    {
      field: 'locked',
      headerName: `Locked (${collection?.split(' ')[1]})`,
      editable: false,
      type: 'string',
      headerAlign: 'left',
      sortable: false,
      filterable: false,
      flex: 1,
      minWidth: 180,
      renderCell: (item: GridRenderCellParams<GetStakingRankDataStaker>) => {
        return getTruncate(item.row.lockStaked, 4);
      },
    },
    {
      field: 'stakes',
      headerName: 'Stakes',
      editable: false,
      type: 'string',
      headerAlign: 'left',
      sortable: false,
      filterable: false,
      flex: 1,
      minWidth: 140,
      renderCell: (item: GridRenderCellParams<GetStakingRankDataStaker>) => {
        return getTruncate(item.row.stakes.toString(), 4);
      },
    },
    {
      field: 'pendingRewards',
      headerName: 'Pending rewards',
      editable: false,
      type: 'string',
      headerAlign: 'right',
      align: 'right',
      sortable: false,
      filterable: false,
      flex: 1,
      minWidth: 180,
      renderCell: (item: GridRenderCellParams<GetStakingRankDataStaker>) => {
        return getTruncate(item.row.pendingRewards, 4);
      },
    },
  ];

  return columns;
};

interface ITxListTable {
  data: GetStakingRankData;
  isLoading: boolean;
  pageSize: number;
  collection: string;
  onPageChange: (model: GridPaginationModel) => void;
}

const TableData = ({ data, pageSize = 10, isLoading, onPageChange, collection }: ITxListTable) => {
  const router = useRouter();

  const handleOnPage = async (model: GridPaginationModel) => {
    await onPageChange(model);
  };

  return (
    <Box>
      <Box sx={{ marginBottom: '40px' }}>
        <DataGrid
          disableColumnMenu
          getRowId={(item: GetStakingRankDataStaker) => Symbol(item.staker).toString()}
          columnHeaderHeight={36}
          rowHeight={64}
          rows={data.stakes ?? []}
          columns={getColumns(collection)}
          keepNonExistentRowsSelected={false}
          rowCount={2}
          loading={isLoading}
          paginationMode="server"
          checkboxSelection={false}
          autoHeight
          disableRowSelectionOnClick={false}
          onRowClick={(item: GridRowParams<GetStakingRankDataStaker>) => {
            router.push(`/staking/detail?owner=${item.row.staker}&collectionName=${collection}`);
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
