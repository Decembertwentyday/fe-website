// ============================================================================
// 【AssetList.tsx】以代币资金维度的详细资产表格 (MUI DataGrid)
// ----------------------------------------------------------------------------
// 与 MyEthscriptions（展示单张铭文维度）不同，这是 ERC20 风格汇总：
// 比如展示你拥有 50000 某代币的总和记录。
// 它渲染在每行的不同币种旁会带有一个「转移」 (Transfer) 以触发展示在表格中的【转移弹窗 AssetTransfer】。
// ============================================================================
import BigNumber from 'bignumber.js';
import { Box, Button, CircularProgress, Link, Pagination, Typography } from '@mui/material';
import { DataGrid, GridColDef, GridPaginationModel, GridRenderCellParams, GridRowParams } from '@mui/x-data-grid';

import { AssetItem, GetHoldersInfoData, GetHoldersItem } from '@/services/ethscriptions/types';
import SubScriptETHSSVG from '@/assets/icons/subscript_eths.svg';
import SubScriptFacetSVG from '@/assets/icons/subscript_facet.svg';
import AssetTransfer from './AssetTransfer';
import { ethers } from 'ethers';
import getTruncate from '@/utils/getTruncate';

interface ITxListTable {
  data: AssetItem[];
  isLoading: boolean;
}

const columns = (): GridColDef<AssetItem>[] => {
  return [
    {
      field: 'token',
      headerName: 'Token',
      type: 'string',
      sortable: false,
      filterable: false,
      minWidth: 240,
      flex: 1,
      headerAlign: 'left',
      align: 'left',
      renderCell: (item: GridRenderCellParams<AssetItem>) => {
        let _href = '/market/token?category=token&collectionName=' + item.row.name;

        if (item.row.category == 'facet') {
          console.log(item.row.bridgedToken);
          if (item.row.bridgedToken?.trim() != '') {
            _href = '/market/token?category=token&collectionName=' + item.row.bridgedToken;
          } else {
            _href = '';
          }
        }

        return (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', position: 'relative', mr: '16px' }}>
              {item.row.icon ? (
                <img
                  src={item.row.icon}
                  height="32px"
                  width="32px"
                  style={{
                    objectFit: 'contain',
                    border: 'none',
                    outline: 'none',
                    imageRendering: 'pixelated',
                  }}
                />
              ) : (
                <Box
                  sx={{
                    height: '32px',
                    width: '32px',
                    bgcolor: 'rgba(255,255,255,0.2)',
                    color: '#fff',
                    borderRadius: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {item.row.name.slice(0, 1).toUpperCase()}
                </Box>
              )}
              <Box sx={{ position: 'absolute', right: '-2px', bottom: '-2px' }}>
                {item.row.category == 'ethereum' ? <SubScriptETHSSVG /> : <SubScriptFacetSVG />}
              </Box>
            </Box>

            <Box
              sx={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}
              onClick={() => {
                _href && window.open(_href);
              }}
            >
              <Typography sx={{ color: '#fff', fontSize: '14px', fontWeight: 500, mr: '6px' }}>
                {item.row.name}
              </Typography>
              <Typography sx={{ color: 'rgba(255,255,255,0.45)', fontSize: '14px', fontWeight: 400 }}>
                {item.row.symbol.toUpperCase()}
              </Typography>
            </Box>
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
      renderCell: (item: GridRenderCellParams<AssetItem>) => {
        return (
          <Box sx={{ color: '#fff', fontSize: '14px', fontWeight: 500, letterSpacing: '1px' }}>{`$${getTruncate(
            item.row.priceUsd,
            4,
          )}`}</Box>
        );
      },
    },
    {
      field: 'amount',
      headerName: 'Amount',
      editable: false,
      type: 'string',
      headerAlign: 'left',
      sortable: false,
      minWidth: 150,
      filterable: false,
      flex: 1,
      renderCell: (item: GridRenderCellParams<AssetItem>) => {
        const amount =
          item.row.category === 'ethereum'
            ? item.row.amount
            : ethers.utils.formatUnits(item.row.amount, item.row.decimals);
        return (
          <Box sx={{ color: '#fff', fontSize: '14px', fontWeight: 500, letterSpacing: '1px' }}>
            {getTruncate(amount, 4)}
          </Box>
        );
      },
    },
    {
      field: 'value',
      headerName: 'Value',
      editable: false,
      type: 'number',
      headerAlign: 'left',
      align: 'left',
      sortable: false,
      filterable: false,
      minWidth: 180,
      flex: 1,
      renderCell: (item: GridRenderCellParams<AssetItem>) => {
        const amount =
          item.row.category === 'ethereum'
            ? item.row.valueUsd
            : new BigNumber(item.row.valueUsd)
                .div(new BigNumber(10).exponentiatedBy(item.row.decimals || 18))
                .toString(10); // ethers.utils.formatUnits(item.row.valueUsd, 18);
        return (
          <Box sx={{ color: '#fff', fontSize: '14px', fontWeight: 500, letterSpacing: '1px' }}>{`$${getTruncate(
            amount,
            4,
          )}`}</Box>
        );
      },
    },
    {
      field: 'actions',
      editable: false,
      type: 'actions',
      headerAlign: 'right',
      headerName: 'Action',
      align: 'right',
      minWidth: 100,
      renderCell: (item: GridRenderCellParams<AssetItem>) => {
        return item.row.category == 'facet' && <AssetTransfer asset={item.row} />;
      },
    },
  ];
};

const TableData = ({ data, isLoading }: ITxListTable) => {
  return (
    <Box
      sx={{
        width: '100%',
        borderRadius: '12px',
        border: '1px solid #2F343E',
        background: '#202229',
        p: '24px',
        boxSizing: 'border-box',
        gap: '48px',
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
        Assets Overview
      </Typography>
      <DataGrid
        disableColumnMenu
        getRowId={(item: AssetItem) => Symbol(`${item.name}${item.symbol}${item.amount}`).toString()}
        columnHeaderHeight={36}
        rowHeight={64}
        rows={data}
        columns={columns()}
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
            borderTop: '1px solid #2F343E',
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
  );
};

export default TableData;
