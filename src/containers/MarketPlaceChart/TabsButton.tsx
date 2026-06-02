import { Button, ButtonProps } from '@mui/material';
import { useState } from 'react';

type TabsButtonProps = {
  defaultValue: string;
  data: string[];
  onSelect: (val: string) => void;
};
const TabsButton = ({ defaultValue, data, onSelect }: TabsButtonProps) => {
  const [value, setValue] = useState<string>(defaultValue);
  return data.map((item) => {
    return (
      <Button
        key={item}
        sx={{
          backgroundColor: item == value ? '#fff' : 'transparent',
          color: item == value ? '#000' : 'rgba(255,255,255,0.45)',
          px: '4px 12px',
          fontSize: '14px',
          borderRadius: '44px',
          fontWeight: 500,
          '&:hover': {
            background: '#fff',
            color: '#000',
          },
        }}
        onClick={() => {
          setValue(item);
          onSelect(item);
        }}
      >
        {item}
      </Button>
    );
  });
};
export default TabsButton;
