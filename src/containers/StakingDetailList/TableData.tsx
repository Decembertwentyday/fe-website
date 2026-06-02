import BigNumber from 'bignumber.js';
import { Box, CircularProgress, Link, Pagination, Typography } from '@mui/material';
import { DataGrid, GridColDef, GridPaginationModel, GridRenderCellParams, GridRowParams } from '@mui/x-data-grid';
import dayjs from 'dayjs';
import { useRouter } from 'next/navigation';

import SharpSVG from '@/assets/icons/sharp.svg';
import EthscriptionLabel from '@/components/EthscriptionLabel';
import { GetStakingRecordData, GetStakingRecordItem } from '@/services/vault/types';
import { useChainId } from 'wagmi';
import { URL_CONFIG } from '@/constants';

const getColumns = (): GridColDef[] => {
  const columns: GridColDef[] = [
    {
      field: 'ethscription',
      headerName: 'Ethscription',
      type: 'string',
      sortable: false,
      filterable: false,
      minWidth: 212,
      flex: 1,
      headerAlign: 'left',
      align: 'left',
      renderCell: (item: GridRenderCellParams<GetStakingRecordItem>) => {
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
              >{`#${item.row.ethscriptionNumber}`}</Typography>
              <SharpSVG color="rgba(255,255,255,0.45)" style={{ marginLeft: '4px' }} />
            </Link>
          </Box>
        );
      },
    },
    {
      field: 'token',
      headerName: 'Token',
      editable: false,
      type: 'string',
      headerAlign: 'left',
      sortable: false,
      filterable: false,
      minWidth: 117,
      flex: 1,
      renderCell: (item: GridRenderCellParams<GetStakingRecordItem>) => {
        return <EthscriptionLabel collectionName={item.row.collectionName} category="token" icon="" />;
      },
    },
    {
      field: 'tokenId',
      headerName: 'TokenId',
      editable: false,
      type: 'string',
      headerAlign: 'left',
      sortable: false,
      filterable: false,
      minWidth: 117,
      flex: 1,
      renderCell: (item: GridRenderCellParams<GetStakingRecordItem>) => {
        return item.row.tokenId;
      },
    },
    {
      field: 'staked',
      headerName: 'Staked',
      editable: false,
      type: 'string',
      headerAlign: 'left',
      sortable: false,
      filterable: false,
      flex: 1,
      minWidth: 160,
      renderCell: (item: GridRenderCellParams<GetStakingRecordItem>) => {
        return item.row.staked;
      },
    },
    // {
    //   field: 'locked',
    //   headerName: 'Locked',
    //   editable: false,
    //   type: 'string',
    //   headerAlign: 'left',
    //   sortable: false,
    //   filterable: false,
    //   flex: 1,
    //   minWidth: 100,
    //   renderCell: (item: GridRenderCellParams<GetStakingRecordItem>) => {
    //     return item.row.;
    //   },
    // },

    {
      field: 'stakeTime',
      headerName: 'Stake Time',
      editable: false,
      type: 'string',
      headerAlign: 'left',
      sortable: false,
      filterable: false,
      flex: 1,
      minWidth: 180,
      renderCell: (item: GridRenderCellParams<GetStakingRecordItem>) => {
        const chainId = useChainId();
        return (
          <Link
            href={`${URL_CONFIG[chainId].etherScanUrl}/tx/${item.row?.stakeTxHash}`}
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
            <Typography width={'165px'}>{dayjs(item.row.stakeTime * 1000).format('YYYY/MM/DD HH:mm:ss')}</Typography>
            <SharpSVG color="rgba(255,255,255,0.45)" />
          </Link>
        );
      },
    },
  ];

  return columns.filter((item) => !['unitPriceUsd', 'marketCap'].includes(item.field));
};

interface ITxListTable {
  data: GetStakingRecordData;
  isLoading: boolean;
  pageSize: number;
  onPageChange: (model: GridPaginationModel) => void;
}

const TableData = ({ data, pageSize = 10, isLoading, onPageChange }: ITxListTable) => {
  const router = useRouter();

  const handleOnPage = async (model: GridPaginationModel) => {
    await onPageChange(model);
  };

  return (
    <Box>
      <Box sx={{ marginBottom: '40px' }}>
        <DataGrid
          disableColumnMenu
          getRowId={(item: GetStakingRecordItem) => Symbol(item.ethscriptionId).toString()}
          columnHeaderHeight={36}
          rowHeight={64}
          rows={data.records ?? []}
          columns={getColumns()}
          keepNonExistentRowsSelected={false}
          rowCount={2}
          loading={isLoading}
          paginationMode="server"
          checkboxSelection={false}
          autoHeight
          disableRowSelectionOnClick
          onRowClick={(item: GridRowParams<GetStakingRecordItem>) => {
            // router.push(`/staking/detail`);
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
