// ============================================================================
// 【CollectionList/TableData.tsx】集合列表表格列定义（MUI DataGrid）
// ----------------------------------------------------------------------------
// 列表列：集合名称、地板价、成交量、持仓地址数、指数变动（带涨跌笠头）
// 每列用 renderCell 自定义样式：
//   - 成交量/持仓数用 K/M/B 单位转换（numberFormatUnit）
//   - 价格用 getTruncate 转换 wei→ETH
//   - 点击行跳转集合详情页
// ============================================================================
import BigNumber from 'bignumber.js';
import { Box, CircularProgress, Pagination, Typography } from '@mui/material';
import { DataGrid, GridColDef, GridPaginationModel, GridRenderCellParams, GridRowParams } from '@mui/x-data-grid';

import { useRouter } from 'next/navigation';
import { GetCollectionListData, GetCollectionListItem, categoryType } from '@/services/marketpalce/types';
import getTruncate from '@/utils/getTruncate';
import EthscriptionLabel from '@/components/EthscriptionLabel';
import { numberFormatUnit } from '@/utils/numberFormatUnit';
import MarketDownSVG from '@/assets/icons/marketDown.svg';
import MarketUpSVG from '@/assets/icons/marketUp.svg';

const getColumns = (category: categoryType): GridColDef[] => {
  function coinValue(value: string, valueView: string) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography sx={{ fontWeight: 500, color: '#fff' }}>{valueView}</Typography>
        {new BigNumber(value).gt(0) && (
          <img style={{ width: '16px', height: '16px' }} src="https://etchmarket.s3.amazonaws.com/eth.svg" />
        )}
      </Box>
    );
  }

  const columns: GridColDef[] = [
    {
      field: 'collection',
      headerName: 'Collection',
      type: 'string',
      sortable: false,
      filterable: false,
      minWidth: 212,
      flex: 1,
      headerAlign: 'left',
      align: 'left',
      renderCell: (item: GridRenderCellParams<GetCollectionListItem>) => {
        return (
          <EthscriptionLabel
            collectionName={item.row.collectionName}
            category={item.row.category}
            icon={item.row.icon}
          />
        );
      },
    },
    {
      field: 'floorPrice',
      headerName: 'Floor Price',
      editable: false,
      type: 'string',
      headerAlign: 'left',
      sortable: false,
      filterable: false,
      minWidth: 90,
      flex: 1,
      renderCell: (item: GridRenderCellParams<GetCollectionListItem>) => {
        return coinValue(item.row.floorPrice, getTruncate(item.row.floorPrice, 4));
      },
    },
    {
      field: 'unitPriceUsd',
      headerName: 'Unit Price',
      editable: false,
      type: 'string',
      headerAlign: 'left',
      sortable: false,
      filterable: false,
      flex: 1,
      minWidth: 120,
      renderCell: (item: GridRenderCellParams<GetCollectionListItem>) => {
        return (
          <Box sx={{ fontWeight: 500, color: '#fff' }}>{`${
            new BigNumber(item.row.unitPriceUsd || '0').gt(0) ? '$' : ''
          } ${getTruncate(item.row.unitPriceUsd, 6)}`}</Box>
        );
      },
    },
    {
      field: '24hChange',
      headerName: '24h Change',
      editable: false,
      type: 'string',
      headerAlign: 'left',
      sortable: false,
      filterable: false,
      flex: 1,
      minWidth: 120,
      renderCell: (item: GridRenderCellParams<GetCollectionListItem>) => {
        return (
          <Box
            color={new BigNumber(item.row.priceChangePercentage24h).lt(0) ? '#D8346F' : '#32CA8A'}
            display="flex"
            alignItems="center"
            justifyContent="center"
            sx={{ gap: '2px', fontWeight: 500 }}
          >
            {`${new BigNumber(item.row.priceChangePercentage24h).multipliedBy(100).toFixed(2)}%`}
            {new BigNumber(item.row.priceChangePercentage24h).lt(0) ? <MarketDownSVG /> : <MarketUpSVG />}
          </Box>
        );
      },
    },

    {
      field: '24hVolume',
      headerName: '24h Volume',
      editable: false,
      type: 'string',
      headerAlign: 'left',
      sortable: false,
      filterable: false,
      flex: 1,
      minWidth: 140,
      renderCell: (item: GridRenderCellParams<GetCollectionListItem>) => {
        return coinValue(item.row.volume24h, getTruncate(item.row.volume24h, 2));
      },
    },

    {
      field: '24hSales',
      headerName: '24h Sales',
      editable: false,
      type: 'string',
      headerAlign: 'left',
      sortable: false,
      filterable: false,
      flex: 1,
      minWidth: 100,
      renderCell: (item: GridRenderCellParams<GetCollectionListItem>) => {
        const { value: sales24h_value, unit: sales24h_unit } = numberFormatUnit(item.row.sales24h);
        return <Box sx={{ fontWeight: 500, color: '#fff' }}>{`${sales24h_value}${sales24h_unit}`}</Box>;
      },
    },

    {
      field: 'marketCap',
      headerName: 'Market Cap',
      editable: false,
      type: 'string',
      headerAlign: 'left',
      sortable: false,
      filterable: false,
      flex: 1,
      minWidth: 180,
      renderCell: (item: GridRenderCellParams<GetCollectionListItem>) => {
        return (
          <Box sx={{ fontWeight: 500, color: '#fff' }}>{`${
            new BigNumber(item.row.marketCap || '0').gt(0) ? '$' : ''
          } ${getTruncate(item.row.marketCap, 2)}`}</Box>
        );
      },
    },

    {
      field: 'owners',
      headerName: 'Owners',
      editable: false,
      type: 'string',
      headerAlign: 'left',
      sortable: false,
      filterable: false,
      flex: 1,
      minWidth: 120,
      renderCell: (item: GridRenderCellParams<GetCollectionListItem>) => {
        return <Box sx={{ fontWeight: 500, color: '#fff' }}>{item.row.owners}</Box>;
      },
    },

    {
      field: 'totalVolume',
      headerName: 'Total Volume',
      editable: false,
      type: 'string',
      headerAlign: 'left',
      sortable: false,
      filterable: false,
      flex: 1,
      minWidth: 120,
      renderCell: (item: GridRenderCellParams<GetCollectionListItem>) => {
        return coinValue(item.row.totalVolume, getTruncate(item.row.totalVolume, 2));
      },
    },
    {
      field: 'totalSales',
      headerName: 'Total Sales',
      editable: false,
      type: 'string',
      headerAlign: 'left',
      sortable: false,
      filterable: false,
      flex: 1,
      minWidth: 80,
      renderCell: (item: GridRenderCellParams<GetCollectionListItem>) => {
        return <Box sx={{ fontWeight: 500, color: '#fff' }}>{item.row.totalSales}</Box>;
      },
    },
    {
      field: 'registrations',
      headerName: 'Registrations',
      editable: false,
      type: 'string',
      headerAlign: 'left',
      sortable: false,
      filterable: false,
      flex: 1,
      minWidth: 100,
      renderCell: (item: GridRenderCellParams<GetCollectionListItem>) => {
        const { value: totalSupply_value, unit: totalSupply_unit } = numberFormatUnit(item.row.totalSupply);
        return <Box sx={{ fontWeight: 500, color: '#fff' }}>{`${totalSupply_value}${totalSupply_unit}`}</Box>;
      },
    },
    {
      field: 'listed',
      headerName: ['nft'].includes(category) ? '% Listed' : 'Listed',
      editable: false,
      type: 'string',
      headerAlign: 'right',
      sortable: false,
      align: 'right',
      filterable: false,
      flex: 1,
      minWidth: ['nft'].includes(category) ? 180 : 90,
      renderCell: (item: GridRenderCellParams<GetCollectionListItem>) => {
        const value = new BigNumber(item.row.itemListed).div(item.row.totalSupply).multipliedBy(100);
        const { value: totalSupply_value, unit: totalSupply_unit } = numberFormatUnit(item.row.totalSupply);
        const { value: itemListed_value, unit: itemListed_unit } = numberFormatUnit(item.row.itemListed);
        return ['nft'].includes(item.row.category) ? (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography
              sx={{ fontWeight: 500, color: '#fff' }}
            >{`${itemListed_value}${itemListed_unit}/${totalSupply_value}${totalSupply_unit}`}</Typography>
            <Typography sx={{ color: 'rgba(255, 255, 255, 0.45)' }}>{`(${value.toFixed(2)}%)`}</Typography>
          </Box>
        ) : (
          <Box sx={{ fontWeight: 500, color: '#fff' }}>{item.row.itemListed}</Box>
        );
      },
    },
  ];

  if (category == 'token') {
    return columns.filter((item) => !['registrations'].includes(item.field));
  }

  if (category == 'domain') {
    return columns.filter((item) => !['unitPriceUsd', 'marketCap', '24hChange'].includes(item.field));
  }

  if (category == 'nft') {
    return columns.filter((item) => !['unitPriceUsd', 'marketCap', 'registrations'].includes(item.field));
  }

  return [];
};

interface ITxListTable {
  category: categoryType;
  data: GetCollectionListData;
  isLoading: boolean;
  pageSize: number;
  onPageChange: (model: GridPaginationModel) => void;
}

const TableData = ({ data, pageSize = 10, isLoading, onPageChange, category }: ITxListTable) => {
  const router = useRouter();

  const handleOnPage = async (model: GridPaginationModel) => {
    await onPageChange(model);
  };

  return (
    <Box>
      <Box sx={{ marginBottom: '40px' }}>
        <DataGrid
          disableColumnMenu
          getRowId={(item: GetCollectionListItem) =>
            Symbol(item.chainName + item.category + item.collectionName + item.owners).toString()
          }
          columnHeaderHeight={36}
          rowHeight={64}
          rows={data.collections ?? []}
          columns={getColumns(category)}
          keepNonExistentRowsSelected={false}
          rowCount={2}
          loading={isLoading}
          paginationMode="server"
          checkboxSelection={false}
          autoHeight
          disableRowSelectionOnClick={false}
          onRowClick={(item: GridRowParams<GetCollectionListItem>) => {
            router.push(
              `/market/${item.row.category}?category=${item.row.category}&collectionName=${item.row.collectionName}`,
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
