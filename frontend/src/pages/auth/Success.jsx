import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import AuthLayout from '../../layout/auth/AuthLayout';
import Button from '../../components/common/Button';
import { Box, Typography } from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';

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
                <Box sx={{
                    width: 80,
                    height: 80,
                    bgcolor: '#F0FDF4',
                    color: 'primary.main',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mx: 'auto',
                    mb: 4
                }}>
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="40"
                        height="40"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                </Box>

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

