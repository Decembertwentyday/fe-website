// ============================================================================
// 【Pagination】自定义分页组件（封装 MUI Pagination）
// ----------------------------------------------------------------------------
// Props:
//   pageSize    = 每页条数
//   pageTotal   = 总条数（字符串类型，来自常见 API）
//   onPageChange = 页码切换回调，GridPaginationModel 包含 { page, pageSize }
// 当总页数 > 1 才渲染，避免只有一页时显示多余的分页控件
// ============================================================================

'use client';

import { Box, Pagination, PaginationProps } from '@mui/material';
import { GridPaginationModel } from '@mui/x-data-grid';

interface ITxListTable {
  pageSize: number;
  pageTotal: string;
  onPageChange: (model: GridPaginationModel) => void;
}
const CustomPagination = ({ pageSize, pageTotal, onPageChange, page }: ITxListTable & PaginationProps) => {
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        width: '100%',
      }}
    >
      {Math.ceil(Number(pageTotal) / pageSize) > 1 && (
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
          page={page}
          size="small"
          count={Math.ceil(Number(pageTotal) / pageSize)}
          variant="outlined"
          shape="rounded"
          onChange={async (event, page) => {
            await onPageChange({ page, pageSize });
          }}
        />
      )}
    </Box>
  );
};

export default CustomPagination;
