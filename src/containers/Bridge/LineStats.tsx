import { Box, Button, Stack, Typography } from '@mui/material';
import { useState } from 'react';

interface ILineStats {
  onSelect?: (days: string) => void;
}

const LineStats: React.FC<ILineStats> = ({ onSelect }) => {
  const stats = [
    { label: '1D', value: '1d' },
    { label: '1W', value: '1w' },
    { label: '1M', value: '1m' },
    { label: '1Y', value: '1y' },
  ];
  const [currentStats, setCurrentStats] = useState(stats[0]);
  return (
    <Box display="flex" alignItems="center" justifyContent="space-between" mb="48px">
      <Typography
        sx={{
          fontSize: '20px',
          fontWeight: '500',
          fontFamily: 'Inter',
          color: '#FFF',
          display: { xs: 'none', sm: 'block' },
        }}
      >
        Stats
      </Typography>
      <Stack direction="row" gap="4px" alignItems="center">
        {stats.map((item) => {
          const { label, value } = item;
          return (
            <Button
              variant="text"
              key={value}
              sx={{
                ':hover': {
                  backgroundColor: '#EAE8E5',
                  color: '#000',
                },
                fontSize: '14px',
                borderRadius: '44px',
                color: value === currentStats.value ? '#000' : 'rgba(255,255,255,0.45)',
                backgroundColor: value === currentStats.value ? '#EAE8E5' : 'transparent',
              }}
              onClick={() => {
                setCurrentStats(item);
                onSelect?.(value);
              }}
            >
              {label}
            </Button>
          );
        })}
      </Stack>
    </Box>
  );
};

LineStats.defaultProps = { onSelect: () => {} };

export default LineStats;
