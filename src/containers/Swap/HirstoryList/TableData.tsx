import { Box, CircularProgress, Link, Pagination, Typography } from '@mui/material';
import { DataGrid, GridColDef, GridPaginationModel, GridRenderCellParams } from '@mui/x-data-grid';

import { GetCollectionDetailData, GetSwapActivityData, ISwapActivityDataItem } from '@/services/marketpalce/types';
import getTruncate from '@/utils/getTruncate';
import { getTimeAgoString } from '@/utils';
import { formatAddress } from '@/utils/addressHelper';
import { FACET_CONFIG } from '@/constants/config';
import SharpSVG from '@/assets/icons/sharp.svg';

interface ITxListTable {
  data: GetSwapActivityData;
  collectionDetail?: GetCollectionDetailData;
  pageSize: number;
  onPageChange: (model: GridPaginationModel) => void;
  isLoading: boolean;
}

const TableData = ({ data, pageSize = 10, collectionDetail, isLoading, onPageChange }: ITxListTable) => {
  const handleOnPage = async (model: GridPaginationModel) => {
    await onPageChange(model);
  };

  const columns = (data: GetSwapActivityData): GridColDef<ISwapActivityDataItem>[] => {
    return [
      {
        field: 'maker',
        headerName: 'Maker',
        editable: false,
        type: 'number',
        headerAlign: 'left',
        align: 'left',
        sortable: false,
        filterable: false,
        minWidth: 180,
        renderCell: (item: GridRenderCellParams<ISwapActivityDataItem>) => {
          const _href = `${FACET_CONFIG.SCAN_FE_URL}/address/${item.row.txHash}`;
          return (
            <Link href={_href} target="_blank" style={{ color: '#fff' }}>
              {formatAddress(item.row.maker)}
            </Link>
          );
        },
      },
      {
        field: 'type',
        headerName: 'Type',
        type: 'string',
        sortable: false,
        filterable: false,
        minWidth: 100,
        flex: 1,
        headerAlign: 'left',
        align: 'left',
        renderCell: (item: GridRenderCellParams<ISwapActivityDataItem>) => {
          return (
            <Box
              sx={{
                color: ['sell', 'remove'].includes(item.row.opType) ? '#D8346F' : '#32CA8A',
                letterSpacing: '1px',
                fontWeight: 500,
                textTransform: 'capitalize',
              }}
            >
              {item.row.opType}
            </Box>
          );
        },
      },
      {
        field: 'price',
        headerName: 'Price',
        editable: false,
        type: 'string',
        headerAlign: 'left',
        minWidth: 150,
        sortable: false,
        filterable: false,
        flex: 1,
        renderCell: (item: GridRenderCellParams<ISwapActivityDataItem>) => {
          return (
            <Box sx={{ color: '#fff', fontSize: '14px', fontWeight: 500, letterSpacing: '1px' }}>{`$${getTruncate(
              item.row.unitPriceUsd,
              6,
            )}`}</Box>
          );
        },
      },
      {
        field: 'amountfrom',
        headerName: `Amount (${collectionDetail?.collections.collectionName.split(' ')[1].toLocaleUpperCase()})`,
        editable: false,
        type: 'string',
        headerAlign: 'left',
        sortable: false,
        minWidth: 150,
        filterable: false,
        flex: 1,
        renderCell: (item: GridRenderCellParams<ISwapActivityDataItem>) => {
          return (
            <Box sx={{ color: '#fff', fontSize: '14px', fontWeight: 500, letterSpacing: '1px' }}>
              {getTruncate(item.row.amountFrom, 3)}
            </Box>
          );
        },
      },
      {
        field: 'amountto',
        headerName: 'Amount (ETH)',
        editable: false,
        type: 'string',
        headerAlign: 'left',
        sortable: false,
        minWidth: 150,
        filterable: false,
        flex: 1,
        renderCell: (item: GridRenderCellParams<ISwapActivityDataItem>) => {
          return (
            <Box sx={{ color: '#fff', fontSize: '14px', fontWeight: 500, letterSpacing: '1px' }}>
              {getTruncate(item.row.amountTo, 3)}
            </Box>
          );
        },
      },
      {
        field: 'total',
        headerName: 'Total',
        editable: false,
        type: 'number',
        headerAlign: 'left',
        align: 'left',
        sortable: false,
        filterable: false,
        minWidth: 150,
        flex: 1,
        renderCell: (item: GridRenderCellParams<ISwapActivityDataItem>) => {
          return (
            <Box sx={{ color: '#fff', fontSize: '14px', fontWeight: 500, letterSpacing: '1px' }}>{`$${getTruncate(
              item.row.volumeUsd,
              3,
            )}`}</Box>
          );
        },
      },

      {
        field: 'time',
        headerName: 'Time',
        type: 'string',
        sortable: false,
        filterable: false,
        minWidth: 100,
        flex: 1,
        headerAlign: 'left',
        align: 'left',
        renderCell: (item: GridRenderCellParams<ISwapActivityDataItem>) => {
          return item.row.txHash.trim() == '' ? (
            <Box>{getTimeAgoString(item.row.eventTime)}</Box>
          ) : (
            <Link
              sx={{
                display: 'flex',
                width: '100%',
                alignItems: 'center',
                justifyContent: 'space-between',
                color: '#fff',
                textDecorationLine: 'none',
              }}
              href={`${FACET_CONFIG.SCAN_FE_URL}/tx/${item.row.txHash}`}
              target="_blank"
            >
              <Box>{getTimeAgoString(item.row.eventTime)}</Box>
              <SharpSVG color="rgba(255,255,255,0.45)" style={{ marginLeft: '4px' }} />
            </Link>
          );
        },
      },
    ];
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Box
        sx={{
          boxSizing: 'border-box',
          marginBottom: '40px',
        }}
      >
        <Typography
          sx={{
            color: '#FFF',
            fontFamily: 'Poppins',
            fontSize: '20px',
            fontWeight: 600,
            letterSpacing: '1px',
            mb: '16px',
          }}
        >
          History
        </Typography>
        <DataGrid
          disableColumnMenu
          getRowId={(item: ISwapActivityDataItem) => Symbol(item.txHash).toString()}
          columnHeaderHeight={36}
          rowHeight={64}
          rows={data.events}
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
                borderBottom: '1px solid #2F343E',
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
          pb: '52px',
        }}
      >
        {Math.ceil(Number(data.page.total || 0) / pageSize) > 1 && (
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
            count={Math.ceil(Number(data.page.total || 0) / pageSize)}
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
