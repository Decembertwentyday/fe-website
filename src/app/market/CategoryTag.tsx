'use client';

import { Box, useMediaQuery } from '@mui/material';

import { categoryType } from '@/services/marketpalce/types';
import { useRouter, useSearchParams } from 'next/navigation';
import { CATEGORY_VALUE_ENUM, CategoryKeyType } from '@/constants';

type CategoryListType = {
  label: CategoryKeyType;
  value: categoryType;
};

const CategoryTag = ({}) => {
  const searchParams = useSearchParams();
  const category = (searchParams.get('category') as categoryType) || 'token';

  const router = useRouter();

  const categoryList: CategoryListType[] = Object.keys(CATEGORY_VALUE_ENUM).map((item) => {
    return {
      label: item as CategoryKeyType,
      value: CATEGORY_VALUE_ENUM[item as CategoryKeyType],
    };
  });

  return (
    <Box sx={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
      {categoryList.map((item) => {
        return (
          <Box
            key={item.label}
            sx={{
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '44px',
              border: item.value == category ? '1px solid #E5FF65' : '1px solid #FFF',
              color: item.value == category ? '#E5FF65' : '#FFF',
              padding: '0 16px',
              boxSizing: 'border-box',
              cursor: 'pointer',
              transition: 'border 0.2s ease-in-out',
              '&:hover': {
                border: '1px solid #E5FF65',
              },
            }}
            onClick={() => {
              router.push(`/market?category=${item.value}`);
            }}
          >
            {item.label}
          </Box>
        );
      })}
    </Box>
  );
};

export default CategoryTag;
