import React from 'react';
import { Button as MuiButton } from '@mui/material';

const Button = ({ variant = 'primary', disabled, onClick, children, type = 'button', className = '', ...props }) => {
    // Map custom 'primary'/'secondary' variants to MUI 'contained'/'outlined' with primary color
    // Based on user's design where both seem to use primary-green scheme.
    // If variant is 'secondary', we use 'outlined' variant in MUI but still 'primary' color due to overrides in theme.

    const muiVariant = variant === 'secondary' ? 'outlined' : 'contained';

    return (
        <MuiButton
            type={type}
            variant={muiVariant}
            color="primary"
            disabled={disabled}
            onClick={onClick}
            fullWidth
            className={className}
            {...props}
        >
            {children}
        </MuiButton>
    );
};

export default Button;

