import { Box, CircularProgress, Link, Pagination, Typography, BoxProps } from '@mui/material';
import {
  DataGrid,
  GridColDef,
  GridColumnHeaderParams,
  GridPaginationModel,
  GridRenderCellParams,
} from '@mui/x-data-grid';
import { useAccount, useChainId } from 'wagmi';

import SharpSVG from '@/assets/icons/sharp.svg';
import { getTimeAgoString, splitDatauri } from '@/utils';
import { URL_CONFIG, mimeTypeImagePre } from '@/constants';
import { ethers } from 'ethers';
import getTruncate from '@/utils/getTruncate';
import EthscriptionLabel from '@/components/EthscriptionLabel';
import { GetRecentTransactionListData, GetRecentTransactionItem } from '@/services/ethscriptions/types';
import CategorySquare from '@/components/CategorySquare';
import { formatAddress } from '@/utils/addressHelper';
import { isAddress } from '@/services/evm/contracts';
import { useMemo } from 'react';

const getColumns = (): GridColDef[] => {
  const columns: GridColDef[] = [
    {
      field: 'token',
      headerName: 'Ethscription',
      type: 'string',
      sortable: false,
      filterable: false,
      minWidth: 100,
      flex: 1,
      headerAlign: 'left',
      align: 'left',
      renderCell: (item: GridRenderCellParams<GetRecentTransactionItem>) => {
        const chainId = useChainId();
        const _url = `${URL_CONFIG[chainId].etherscription}/ethscriptions/${item.row.ethscriptionId}`;
        const [pre, data] = splitDatauri(item.row.content || '');
        const isImage = useMemo(() => {
          return item.row.category === 'image' || pre.includes(mimeTypeImagePre);
        }, [item]);
        return (
          <Link
            href={_url}
            sx={{
              display: 'flex',
              alignItems: 'center',
              color: 'white',
              cursor: 'pointer',
              textDecorationLine: 'none',
            }}
            target="_blank"
          >
            {(item.row.icon || item.row.content) && (
              <img
                src={isImage && item.row.content ? item.row.content : item.row.icon}
                style={{ width: '32px', height: '32px' }}
                alt="icon"
              />
            )}
            <Box ml={'8px'}>
              <Typography fontWeight={'500'} fontSize={14} mr={item.row.collectionName ? '8px' : '0'}>
                {item.row.category === 'domain' ? item.row.content.slice(6) : item.row.collectionName}
              </Typography>
              <Typography fontWeight={500} fontSize={'14px'} mr="6px">{`#${item.row.ethscriptionNumber}`}</Typography>
            </Box>
          </Link>
        );
      },
    },
    {
      field: 'event',
      headerName: 'Event',
      editable: false,
      type: 'string',
      headerAlign: 'left',
      sortable: false,
      filterable: false,
      minWidth: 80,
      flex: 1,
      renderCell: (item: GridRenderCellParams<GetRecentTransactionItem>) => {
        let colorText = '#FFFFFF';
        if (item.row.event == 'sale') {
          colorText = '#D8346F';
        } else if (item.row.event == 'list') {
          colorText = '#3ABB94';
        } else if (['transfer', 'contract-transfer'].includes(item.row.event)) {
          colorText = '#66BFFF';
        }
        return <Box sx={{ textTransform: 'capitalize', color: colorText }}>{item.row.event}</Box>;
      },
    },
    {
      field: 'marketplace',
      headerName: 'Market',
      editable: false,
      type: 'string',
      headerAlign: 'left',
      sortable: false,
      filterable: false,
      minWidth: 128,
      flex: 1,
      renderCell: (item: GridRenderCellParams<GetRecentTransactionItem>) => {
        return (
          <Box>
            {(isAddress(item.row.marketplace) ? formatAddress(item.row.marketplace) : item.row.marketplace) || '--'}
          </Box>
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
      minWidth: 128,
      flex: 1,
      renderCell: (item: GridRenderCellParams<GetRecentTransactionItem>) => {
        const { address } = useAccount();
        const addressDisplay =
          address && item.row.from && ethers.utils.getAddress(address) === ethers.utils.getAddress(item.row.from)
            ? 'you'
            : `${item.row.from.slice(0, 5)}...${item.row.from.slice(-5)}`;
        return (
          <Link
            href={`/tokens/search?address=${item.row.from}`}
            sx={{
              color: 'rgba(255,255,255,0.44)',
              cursor: 'pointer',
              textDecorationLine: item.row.from ? 'underline' : 'none',
            }}
            target="_blank"
          >
            {addressDisplay}
          </Link>
        );
      },
    },
    {
      field: '3',
      headerName: 'To',
      editable: false,
      type: 'number',
      headerAlign: 'left',
      align: 'left',
      sortable: false,
      filterable: false,
      minWidth: 128,
      flex: 1,
      renderCell: (item: GridRenderCellParams<GetRecentTransactionItem>) => {
        const { address } = useAccount();

        const addressDisplay = item.row.to
          ? address && ethers.utils.getAddress(address) === ethers.utils.getAddress(item.row.to)
            ? 'you'
            : `${item.row.to.slice(0, 5)}...${item.row.to.slice(-5)}`
          : '--';
        return (
          <Link
            href={`/tokens/search?address=${item.row.to}`}
            sx={{
              color: 'rgba(255,255,255,0.44)',
              cursor: 'pointer',
              paddingRight: '40px',
              textDecorationLine: item.row.to ? 'underline' : 'none',
            }}
            target="_blank"
          >
            {addressDisplay}
          </Link>
        );
      },
    },
    {
      field: 'totalValue',
      headerName: 'Value',
      editable: false,
      type: 'number',
      headerAlign: 'left',
      align: 'left',
      sortable: false,
      filterable: false,
      minWidth: 140,
      flex: 1,
      renderCell: (item: GridRenderCellParams<GetRecentTransactionItem>) => {
        return item.row.price.trim() == '0' ? (
          '--'
        ) : (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography>{getTruncate(item.row.price, 4)}</Typography>
            <Typography sx={{ color: 'rgba(255,255,255,0.45)', ml: '6px' }}>ETH</Typography>
          </Box>
        );
      },
    },
    {
      field: '4',
      headerName: 'Time',
      editable: false,
      type: 'number',
      headerAlign: 'left',
      align: 'left',
      sortable: false,
      filterable: false,
      minWidth: 160,
      renderCell: (item: GridRenderCellParams<GetRecentTransactionItem>) => {
        const chainId = useChainId();

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
            href={`${URL_CONFIG[chainId].etherScanUrl}/tx/${item.row.txHash}`}
            target="_blank"
          >
            <Box>{getTimeAgoString(item.row.eventTime)}</Box>
            <SharpSVG color="rgba(255,255,255,0.45)" style={{ marginLeft: '4px' }} />
          </Link>
        );
      },
    },
  ];
  return columns;
};

interface ITxListTable {
  data: GetRecentTransactionListData;
  pageSize: number;
  onPageChange: (model: GridPaginationModel) => void;
  isLoading: boolean;
}

const TableData = ({ data, pageSize = 10, isLoading, onPageChange }: ITxListTable) => {
  const handleOnPage = async (model: GridPaginationModel) => {
    await onPageChange(model);
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ marginBottom: '40px' }}>
        <DataGrid
          disableColumnMenu
          getRowId={(item: GetRecentTransactionItem) =>
            Symbol(item.ethscriptionId + item.ethscriptionNumber + item.txHash + item.event + item.eventTime).toString()
          }
          columnHeaderHeight={36}
          rowHeight={64}
          rows={data.transactions ?? []}
          columns={getColumns()}
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
