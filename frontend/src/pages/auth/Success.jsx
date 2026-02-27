import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import AuthLayout from '../../layout/auth/AuthLayout';
import Button from '../../components/common/Button';
import { Box, Typography } from '@mui/material';
import logo from '../../assets/images/Verified_logo.png';


const Success = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const mode = location.state?.mode || 'login';

    const handleNavigation = () => {
        if (mode === 'signup') {
            navigate('/select-machine');
        } else {
            navigate('/select-machine');
        }
    };

    return (
        <AuthLayout hideLeftPanel={true}>
            <Box sx={{ textAlign: 'center', pt: { xs: 4, md: 0 } }}>
                <Box
                    component="img"
                    src={logo}
                    alt="Verified Logo"
                    sx={{ height: 90, mx: 'auto', mb: { xs: 5, md: 2 }, display: 'block' }}
                    onError={(e) => { e.target.style.display = 'none' }}
                />


                <Typography variant="h2" sx={{ mb: 1 }}>
                    Successfully Verified
                </Typography>

                <Typography variant="subtitle2" sx={{ mb: 4 }}>
                    {mode === 'signup'
                        ? "Your account has been successfully verified. You'll be redirected shortly to the Registration Form"
                        : "Your account has been successfully verified."}
                </Typography>

                <Button onClick={handleNavigation}>
                    {mode === 'signup' ? "Select  Weighing  Machine" : "Select  Weighing  Machine"}
                </Button>
            </Box>
        </AuthLayout>
    );
};

export default Success;

