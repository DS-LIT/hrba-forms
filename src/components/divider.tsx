import React from 'react';
import { Box } from '@mui/material';

interface DividerProps {
    colorClass?: string;
    thickness?: string;
}

const Divider: React.FC<DividerProps> = ({ colorClass = 'primary', thickness = '1px' }) => {
    return (
        <Box
            className={`divider ${colorClass}`}
            sx={{
                borderWidth: thickness,
            }}
        />
    );
};

export default Divider;