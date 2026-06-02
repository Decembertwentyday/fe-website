import BigNumber from 'bignumber.js';
import { Box, CircularProgress, Link, Pagination, Typography } from '@mui/material';
import { DataGrid, GridColDef, GridPaginationModel, GridRenderCellParams, GridRowParams } from '@mui/x-data-grid';

import ProgressBar from '@/containers/ProgressBar';
import { GetHoldersInfoData, GetHoldersItem } from '@/services/ethscriptions/types';
import SharpSVG from '@/assets/icons/sharp.svg';
import { URL_CONFIG } from '@/constants';
import { useChainId } from 'wagmi';

interface ITxListTable {
  collectionName: string;
  data: GetHoldersInfoData;
  pageSize: number;
  onPageChange: (model: GridPaginationModel) => void;
  isLoading: boolean;
}

const TableData = ({ data, pageSize = 10, isLoading, onPageChange }: ITxListTable) => {
  const chainId = useChainId();

  const columns = (data: GetHoldersInfoData): GridColDef<GetHoldersItem>[] => {
    return [
      {
        field: 'rank',
        headerName: 'Rank',
        type: 'string',
        sortable: false,
        filterable: false,
        width: 120,
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
        sortable: false,
        filterable: false,
        minWidth: 230,
        flex: 1,
        renderCell: (item: GridRenderCellParams<GetHoldersItem>) => {
          const _url = `${URL_CONFIG[chainId].etherscription}/${item.row.holder}`;
          return (
            <Box>
              <Link
                href={_url}
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
        filterable: false,
        minWidth: 280,
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
        minWidth: 200,
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
