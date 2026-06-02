// ============================================================================
// 【OrderList/TableData.tsx】订单历史表格列定义（MUI DataGrid）
// ----------------------------------------------------------------------------
// 列表列：铭文名称、价格、状态标签、时间（ago）、交易哈希链接
// 状态颜色：sold=综色、listing=荧光黄、cancelled=灰色
// 价格用 getTruncate 转换 wei→ETH、ROUND_DOWN 防超
// ============================================================================
import { Box, CircularProgress, Link, Pagination, Typography } from '@mui/material';
import {
  DataGrid,
  GridColDef,
  GridColumnHeaderParams,
  GridPaginationModel,
  GridRenderCellParams,
} from '@mui/x-data-grid';
import { useAccount, useChainId } from 'wagmi';

import SharpSVG from '@/assets/icons/sharp.svg';
import { GetHistoryOrderData, GetHistoryOrderItem, categoryType } from '@/services/marketpalce/types';
import { getTimeAgoString } from '@/utils';
import { URL_CONFIG } from '@/constants';
import { ethers } from 'ethers';
import getTruncate from '@/utils/getTruncate';
import EthscriptionLabel from '@/components/EthscriptionLabel';
import EthsLabelCard from '@/components/EthsLabelCard';

const getColumns = (category: categoryType): GridColDef[] => {
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
      renderCell: (item: GridRenderCellParams<GetHistoryOrderItem>) => {
        const chainId = useChainId();
        const _url = `${URL_CONFIG[chainId].etherscription}/ethscriptions/${item.row.ethscriptionId}`;
        return (
          <Link
            href={_url}
            sx={{
              display: 'flex',
              alignItems: 'center',
              color: 'rgba(255,255,255,0.44)',
              cursor: 'pointer',
              textDecorationLine: 'none',
            }}
            target="_blank"
          >
            <Typography mr="6px">{`#${item.row.ethscriptionNumber}`}</Typography>
            <SharpSVG color="rgba(255,255,255,0.45)" style={{ marginLeft: '4px' }} />
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
      renderCell: (item: GridRenderCellParams<GetHistoryOrderItem>) => {
        let colorText = '#FFFFFF';
        if (item.row.event == 'sold') {
          colorText = '#D8346F';
        } else if (item.row.event == 'listing') {
          colorText = '#3ABB94';
        } else if (['transfer', 'contract-transfer'].includes(item.row.event)) {
          colorText = '#66BFFF';
        }
        return <Box sx={{ textTransform: 'capitalize', color: colorText }}>{item.row.event}</Box>;
      },
    },
    {
      field: 'collection-name',
      headerName: category == 'domain' ? 'Name' : 'Collection',
      editable: false,
      type: 'string',
      headerAlign: 'left',
      sortable: false,
      filterable: false,
      minWidth: 200,
      flex: 1,
      renderCell: (item: GridRenderCellParams<GetHistoryOrderItem>) => {
        const _collectionName =
          item.row.category == 'domain' ? item.row.content.replace('data:,', '') : item.row.collectionName;
        return (
          <EthscriptionLabel
            domainDot={false}
            collectionName={_collectionName}
            category={item.row.category}
            icon={item.row.content}
          />
        );
      },
    },
    {
      field: 'quantity',
      headerName: 'Quantity',
      editable: false,
      type: 'number',
      headerAlign: 'center',
      align: 'center',
      sortable: false,
      filterable: false,
      minWidth: 120,
      flex: 1,
      renderCell: (item: GridRenderCellParams<GetHistoryOrderItem>) => {
        return <Box>{item.row.quantity}</Box>;
      },
    },
    {
      field: 'unitPrice',
      headerName: 'Unit Price',
      editable: false,
      type: 'string',
      headerAlign: 'left',
      sortable: false,
      filterable: false,
      minWidth: 160,
      flex: 1,
      renderCell: (item: GridRenderCellParams<GetHistoryOrderItem>) => {
        return item.row.unitPriceUsd.trim() == '0' ? (
          '--'
        ) : (
          <Typography>{`$${getTruncate(item.row.unitPriceUsd, 4)}`}</Typography>
        );
      },
    },
    {
      field: 'totalValue',
      headerName: category == 'domain' ? 'Value' : 'Total Value',
      editable: false,
      type: 'number',
      headerAlign: 'left',
      align: 'left',
      sortable: false,
      filterable: false,
      minWidth: 140,
      flex: 1,
      renderCell: (item: GridRenderCellParams<GetHistoryOrderItem>) => {
        return item.row.priceUsd.trim() == '0' ? (
          '--'
        ) : (
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Typography>{getTruncate(item.row.price, 4)}</Typography>
              <Typography sx={{ color: 'rgba(255,255,255,0.45)', ml: '6px' }}>{item.row.payment.name}</Typography>
            </Box>
            <Typography sx={{ color: 'rgba(255,255,255,0.45)', fontSize: '16px' }}>{`$ ${getTruncate(
              item.row.priceUsd,
              4,
            )}`}</Typography>
          </Box>
        );
      },
    },
    {
      field: '2',
      headerName: 'From',
      editable: false,
      type: 'number',
      headerAlign: 'left',
      align: 'left',
      sortable: false,
      filterable: false,
      minWidth: 128,
      flex: 1,
      renderCell: (item: GridRenderCellParams<GetHistoryOrderItem>) => {
        const { address } = useAccount();
        const addressDisplay =
          address && ethers.utils.getAddress(address) === ethers.utils.getAddress(item.row.from)
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
      renderCell: (item: GridRenderCellParams<GetHistoryOrderItem>) => {
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
      field: '4',
      headerName: 'Time',
      editable: false,
      type: 'number',
      headerAlign: 'left',
      align: 'left',
      sortable: false,
      filterable: false,
      minWidth: 160,
      renderCell: (item: GridRenderCellParams<GetHistoryOrderItem>) => {
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

  if (category == 'domain') {
    return columns.filter((item) => !['unitPrice', 'quantity'].includes(item.field));
  }

  return columns;
};

interface ITxListTable {
  category: categoryType;
  data: GetHistoryOrderData;
  pageSize: number;
  onPageChange: (model: GridPaginationModel) => void;
  isLoading: boolean;
}

const TableData = ({ data, pageSize = 10, isLoading, category, onPageChange }: ITxListTable) => {
  const handleOnPage = async (model: GridPaginationModel) => {
    await onPageChange(model);
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ marginBottom: '40px' }}>
        <DataGrid
          disableColumnMenu
          getRowId={(item: GetHistoryOrderItem) =>
            Symbol(item.ethscriptionId + item.txHash + item.event + item.eventTime).toString()
          }
          columnHeaderHeight={36}
          rowHeight={64}
          rows={data.events ?? []}
          columns={getColumns(category)}
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
