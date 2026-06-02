import { Box, CircularProgress } from '@mui/material';
import { DataGrid, GridColDef, GridRenderCellParams, GridRowParams } from '@mui/x-data-grid';

import { GetCollectionOwnerListItem } from '@/services/marketpalce/types';
import { useEthscriptionCollectionOwnerContext } from '../EthscriptionCollectionContext';
import EthscriptionLabel from '@/components/EthscriptionLabel';

const columns: GridColDef[] = [
  {
    field: 'token',
    headerName: 'Token',
    type: 'string',
    sortable: false,
    filterable: false,
    width: 140,
    headerAlign: 'left',
    align: 'left',
    renderCell: (item: GridRenderCellParams<GetCollectionOwnerListItem>) => {
      return (
        <EthscriptionLabel collectionName={item.row.collectionName} category={item.row.category} icon={item.row.icon} />
      );
    },
  },
  {
    field: 'volume',
    headerName: 'Verified',
    editable: false,
    type: 'string',
    headerAlign: 'left',
    sortable: false,
    filterable: false,
    width: 120,
    renderCell: (item: GridRenderCellParams<GetCollectionOwnerListItem>) => {
      return <Box>{item.row.verifiedAmt}</Box>;
    },
  },
  {
    field: 'price',
    headerName: 'Total',
    editable: false,
    type: 'string',
    headerAlign: 'left',
    sortable: false,
    filterable: false,
    width: 120,
    renderCell: (item: GridRenderCellParams<GetCollectionOwnerListItem>) => {
      return <Box>{item.row.totalAmt}</Box>;
    },
  },
  {
    field: 'time',
    headerName: 'Value (USD)',
    editable: false,
    type: 'number',
    headerAlign: 'left',
    align: 'left',
    sortable: false,
    filterable: false,
    width: 80,
    renderCell: (item: GridRenderCellParams<GetCollectionOwnerListItem>) => {
      return <Box>{item.row.value}</Box>;
    },
  },
];

const TableData = () => {
  const { onSelect, collectionList, isLoading } = useEthscriptionCollectionOwnerContext();
  return (
    <Box sx={{ width: '100%' }}>
      <DataGrid
        disableColumnMenu
        getRowId={(item: GetCollectionOwnerListItem) => Symbol(item.collectionName).toString()}
        columnHeaderHeight={36}
        rowHeight={64}
        rows={collectionList?.collections.filter((item) => item.collectionName !== '') ?? []}
        columns={columns}
        keepNonExistentRowsSelected={false}
        rowCount={2}
        loading={isLoading}
        paginationMode="server"
        checkboxSelection={false}
        autoHeight
        disableRowSelectionOnClick={false}
        onRowClick={async (item: GridRowParams<GetCollectionOwnerListItem>) => {
          await onSelect(item.row);
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
          height: '400px',
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
          '& .MuiDataGrid-virtualScroller': {
            height: '380px',
            overflowY: 'scroll !important',
            '&::-webkit-scrollbar': {
              width: '0.4em',
            },
            '&:hover': {
              '&::-webkit-scrollbar-thumb': {
                backgroundColor: 'rgba(255,255,255,0.5)',
                webkitBoxShadow: 'inset 0 0 5px rgba(0, 0, 0, 0.2)',
              },
              '&::-webkit-scrollbar-track': {
                backgroundColor: 'transparent',
              },
            },
          },
        }}
      />
    </Box>
  );
};

export default TableData;
