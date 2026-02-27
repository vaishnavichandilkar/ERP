import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthLayout from '../../layout/auth/AuthLayout';
import Button from '../../components/common/Button';
import { Box, Typography, Autocomplete, TextField } from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import logo from '../../assets/images/logo2.png';

const machineOptions = ['Machine 1', 'Machine 2', 'Others'];
const modelOptions = ['HGDHJ764754675', 'JHFHFG76576556', 'Others'];
const typeOptions = ['Mechanical', 'Digital', 'Automatic'];

const SelectMachine = () => {
    const navigate = useNavigate();
    const [isUsingMachine, setIsUsingMachine] = useState(null);

    const [machineName, setMachineName] = useState('');
    const [modelNumber, setModelNumber] = useState('');
    const [machineType, setMachineType] = useState('');

    const handleDashboard = () => {
        navigate('/dashboard');
    };

    const renderDropdown = (label, placeholder, value, setValue, options, mb) => (
        <Autocomplete
            freeSolo
            forcePopupIcon={true}
            popupIcon={<KeyboardArrowDownIcon />}
            options={options}
            value={value}
            onChange={(e, v) => setValue(v || '')}
            onInputChange={(e, v) => setValue(v)}
            renderInput={(params) => (
                <TextField
                    {...params}
                    label={label}
                    placeholder={placeholder}
                    variant="outlined"
                    InputLabelProps={{ shrink: true }}
                    fullWidth
                    sx={{ mb }}
                />
            )}
        />
    );

    const getBtnStyle = (selected) => ({
        flex: 0,
        minWidth: '100px',
        py: 1,
        borderRadius: '8px',
        color: '#FFFFFF',
        bgcolor: selected === true ? '#0B3D2E' : '#9DB3A8',
        textTransform: 'none',
        boxShadow: 'none',
        '&:hover': {
            bgcolor: selected === true ? '#092E22' : '#8CA397',
            boxShadow: 'none',
        }
    });

    return (
        <AuthLayout>
            <Box sx={{ textAlign: 'left', width: '100%', maxWidth: '400px', mx: 'auto' }}>
                <Box
                    component="img"
                    src={logo}
                    alt="WeighPro Logo"
                    sx={{ height: 40, mb: 2, display: 'block' }}
                    onError={(e) => { e.target.style.display = 'none' }}
                />

                <Typography variant="h2" sx={{ mb: 1 }}>
                    Select Your Weighing<br />Machine & Model
                </Typography>

                <Typography variant="subtitle2" sx={{ mb: 4 }}>
                    Set up your device to ensure accurate, secure, and reliable weighing operations from day one.
                </Typography>

                <Typography variant="body2" sx={{ fontWeight: 500, mb: 1.5 }}>
                    Are you using your Weighing Machine?
                </Typography>

                <Box sx={{ display: 'flex', gap: 1.5, mb: 4 }}>
                    <Button
                        variant="contained"
                        onClick={() => setIsUsingMachine(true)}
                        sx={getBtnStyle(isUsingMachine === true)}
                        startIcon={<CheckCircleOutlineIcon />}
                    >
                        Yes
                    </Button>
                    <Button
                        variant="contained"
                        onClick={() => setIsUsingMachine(false)}
                        sx={getBtnStyle(isUsingMachine === false)}
                        startIcon={<HighlightOffIcon />}
                    >
                        No
                    </Button>
                </Box>

                <Box component="form" noValidate>
                    {isUsingMachine === null && (
                        <>
                            {renderDropdown("Select Weight Machine", "Select Weight Machine", machineName, setMachineName, machineOptions, 3)}
                            {renderDropdown("Select Model", "Select Model", modelNumber, setModelNumber, modelOptions, 3)}
                            {renderDropdown("Weight Machine Type", "Select Type", machineType, setMachineType, typeOptions, 4)}
                        </>
                    )}
                    {isUsingMachine === true && (
                        <>
                            {renderDropdown("Select/Enter your Machine Name", "Select/Enter Machine Name", machineName, setMachineName, machineOptions, 3)}
                            {renderDropdown("Select/Enter Model Number", "Select/Enter Model Number", modelNumber, setModelNumber, modelOptions, 3)}
                            {renderDropdown("Select/Enter Weight Machine Type", "Select/Enter Machine Type", machineType, setMachineType, typeOptions, 4)}
                        </>
                    )}
                    {isUsingMachine === false && (
                        <>
                            {renderDropdown("Select Weighing Machine", "Weighing Scale", machineName, setMachineName, machineOptions, 3)}
                            {renderDropdown("Select Model Number", "RTDRT65435876", modelNumber, setModelNumber, modelOptions, 4)}
                        </>
                    )}

                    <Button
                        onClick={handleDashboard}
                        disabled={isUsingMachine === null || (isUsingMachine ? (!machineName || !modelNumber || !machineType) : (!machineName || !modelNumber))}
                    >
                        Go to Dashboard
                    </Button>
                </Box>
            </Box>
        </AuthLayout>
    );
};

export default SelectMachine;
