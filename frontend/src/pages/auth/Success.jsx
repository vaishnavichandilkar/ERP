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
            // As per design text "Go to Registration Form", but logically likely Login or Dashboard.
            // I will navigate to Login since user is verified.
            navigate('/registration-form');
        } else {
            navigate('/dashboard');
        }
    };

    return (
        <AuthLayout>
            <Box sx={{ textAlign: 'center' }}>
                <Box
                   component="img"
                   src={logo}
                   alt="WeighPro Logo"
                   sx={{ height: 90, marginLeft:'50px', mb: 2, display: 'block' }}
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
                    {mode === 'signup' ? "Go to Registration Form" : "Go to Dashboard"}
                </Button>
            </Box>
        </AuthLayout>
    );
};

export default Success;

