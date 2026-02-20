import React from 'react';
import { TextField, InputAdornment } from '@mui/material';

const Input = ({ label, type = 'text', value, onChange, placeholder, name, required, startIcon, endIcon, ...props }) => {
    return (
        <TextField
            fullWidth
            label={label}
            id={name}
            name={name}
            type={type}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            required={required}
            variant="outlined"
            InputLabelProps={{ shrink: true }}
            InputProps={{
                startAdornment: startIcon ? (
                    <InputAdornment position="start" sx={{ color: 'text.secondary' }}>
                        {startIcon}
                    </InputAdornment>
                ) : null,
                endAdornment: endIcon ? (
                    <InputAdornment position="end" sx={{ color: 'text.secondary' }}>
                        {endIcon}
                    </InputAdornment>
                ) : null,
            }}
            {...props}
        />
    );
};

export default Input;

