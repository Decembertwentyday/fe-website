import { Box, CircularProgress, Link, Typography } from '@mui/material';
import { DataGrid, GridColDef, GridRenderCellParams, GridRowParams } from '@mui/x-data-grid';

import { Fragment, useEffect, useState } from 'react';

import { GetHistoryOrderItem } from '@/services/marketpalce/types';
import ETHSVG from '@/assets/icons/eth16.svg';
import SharpSVG from '@/assets/icons/sharp.svg';
import services from '@/services';
import { formatAddress } from '@/utils/addressHelper';
import { URL_CONFIG } from '@/constants';
import { useChainId } from 'wagmi';
import dayjs from 'dayjs';
import { useSearchParams } from 'next/navigation';
import { usePathname } from 'next/navigation';

const columns: GridColDef[] = [
  {
    field: 'event',
    headerName: 'Event',
    type: 'string',
    sortable: false,
    filterable: false,
    width: 100,
    headerAlign: 'left',
    align: 'left',
    renderCell: (item: GridRenderCellParams<GetHistoryOrderItem>) => {
      let colorText = '#FFFFFF';
      if (item.row.event == 'sold') {
        colorText = '#D8346F';
      } else if (item.row.event == 'listing') {
        colorText = '#3ABB94';
      } else if (['transfer', 'contract-transfer'].includes(item.row.event)) {
        colorText = '#66BFFF';
      }
      return (
        <Typography sx={{ textTransform: 'capitalize', color: colorText, fontSize: '14px' }}>
          {item.row.event}
        </Typography>
      );
    },
  },
  {
    field: 'price',
    headerName: 'Price',
    editable: false,
    type: 'string',
    headerAlign: 'left',
    align: 'left',
    sortable: false,
    filterable: false,
    width: 100,
    renderCell: (item: GridRenderCellParams<GetHistoryOrderItem>) => {
      const priceCondition = item.row.event === 'sold' || item.row.event === 'listing';
      return (
        <Box>
          {priceCondition ? (
            <Typography
              sx={{
                fontSize: '14px',
                color: '#FFF',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              {item.row.price}
              <ETHSVG />
            </Typography>
          ) : (
            '--'
          )}
        </Box>
      );
    },
  },
  {
    field: 'form',
    headerName: 'From',
    editable: false,
    type: 'string',
    headerAlign: 'left',
    align: 'left',
    sortable: false,
    filterable: false,
    width: 120,
    renderCell: (item: GridRenderCellParams<GetHistoryOrderItem>) => {
      return (
        <Typography sx={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.45)' }}>
          {formatAddress(item.row.from)}
        </Typography>
      );
    },
  },
  {
    field: 'to',
    headerName: 'To',
    editable: false,
    type: 'string',
    headerAlign: 'left',
    align: 'left',
    sortable: false,
    filterable: false,
    width: 120,
    renderCell: (item: GridRenderCellParams<GetHistoryOrderItem>) => {
      return (
        <Typography sx={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.45)' }}>
          {item.row.to ? formatAddress(item.row.to) : '--'}
        </Typography>
      );
    },
  },
  {
    field: 'time',
    headerName: 'Time',
    editable: false,
    type: 'number',
    headerAlign: 'left',
    align: 'left',
    sortable: false,
    filterable: false,
    width: 130,
    renderCell: (item: GridRenderCellParams<GetHistoryOrderItem>) => {
      const chainId = useChainId();
      const time = dayjs(Number(item.row.eventTime) * 1000)
        .format('YYYY/MM/DD HH:mm:ss')
        .split(' ');
      const _url = `${URL_CONFIG[chainId].etherScanUrl}/tx/${item.row.txHash}`;
      return (
        <Box sx={{ display: 'flex', gap: '20px' }}>
          <Box>
            <Typography sx={{ fontSize: '14px', color: '#FFF' }}>{time[0]}</Typography>
            <Typography sx={{ fontSize: '14px', color: '#FFF' }}>{time[1]}</Typography>
          </Box>
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
            <SharpSVG color="rgba(255,255,255,0.45)" />
          </Link>
        </Box>
      );
    },
  },
];

const TableData = () => {
  const pathname = usePathname();
  const pathnameArr = pathname.split('/');
  const ethsId = pathnameArr[pathnameArr.length - 1];

  const [activityList, setActivityList] = useState<GetHistoryOrderItem[]>();

  async function getEthscriptionActivity() {
    const response = await services.marketplace.getEtherscriptionActivity(ethsId);
    setActivityList(response?.data.events);
  }

  useEffect(() => {
    if (ethsId !== '') {
      getEthscriptionActivity();
    }
  }, []);

  return (
    <Box sx={{ width: '100%' }}>
      <DataGrid
        disableColumnMenu
        getRowId={(item: GetHistoryOrderItem) =>
          Symbol(item.ethscriptionId + item.ethscriptionId + item.eventTime).toString()
        }
        columnHeaderHeight={36}
        rowHeight={64}
        rows={activityList ?? []}
        columns={columns}
        keepNonExistentRowsSelected={false}
        rowCount={2}
        // loading={isLoading}
        paginationMode="server"
        checkboxSelection={false}
        autoHeight
        disableRowSelectionOnClick={false}
        onRowClick={async (item: GridRowParams<GetHistoryOrderItem>) => {
          // await onSelect(item.row);
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
            minHeight: '240px',
            maxHeight: '500px',
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
