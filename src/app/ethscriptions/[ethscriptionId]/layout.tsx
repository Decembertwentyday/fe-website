'use client';

import { Box, Button } from '@mui/material';
import { useEffect, useState } from 'react';

export default function indexerLayout({ children }: { children: React.ReactNode }) {
  return (
    <Box sx={{ minHeight: 'calc(100vh - 203.5px)', width: { xs: '100%', sm: '1160px' }, margin: '0 auto' }}>
      {children}
    </Box>
  );
}
