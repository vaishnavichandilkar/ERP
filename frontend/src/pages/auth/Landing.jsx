import React from 'react';
import { useNavigate } from 'react-router-dom';
import AuthLayout from '../../layout/auth/AuthLayout';
import Button from '../../components/common/Button';
import logo from '../../assets/images/logo2.png';
import { Box, Typography, Stack, Divider } from '@mui/material';

const Landing = () => {
    const navigate = useNavigate();

    return (
        <AuthLayout>
            <Box sx={{ textAlign: 'left' }}>
                <Box sx={{ mb: 2 }}>
                    <Box
                        component="img"
                        src={logo}
                        alt="WeighPro Logo"
                        sx={{ height: 40, mb: 2, display: 'block' }}
                        onError={(e) => { e.target.style.display = 'none' }}
                    />

                    <Typography variant="h2" sx={{ mb: 1 }}>
                        Welcome to WeighPro
                    </Typography>
                    <Typography variant="subtitle2" sx={{ mb: 4 }}>
                        Login or create an account to continue
                    </Typography>
                </Box>

                <Box sx={{ mb: 4 }}>
                    <Typography variant="body1" sx={{ fontWeight: 600, color: 'text.primary', mb: 2, textAlign: 'center', display: 'block' }}>
                        Are you a GramUnati User?
                    </Typography>

                    <Box sx={{ mt: 3 }}>
                        <Typography variant="body2" sx={{ mb: 1, color: 'text.secondary', fontWeight: 500 }}>
                            Yes, I am a GramUnati user
                        </Typography>
                        <Button
                            variant="primary"
                            onClick={() => navigate('/login')}
                        >
                            Go to Login Page
                        </Button>
                    </Box>

                    <Divider sx={{ my: 3, color: '#9CA3AF', fontWeight: 500, fontSize: '14px', '&::before, &::after': { borderColor: '#E5E7EB' } }}>
                        OR
                    </Divider>

                    <Box>
                        <Typography variant="body2" sx={{ mb: 1, color: 'text.secondary', fontWeight: 500 }}>
                            No, I am a new user
                        </Typography>
                        <Button
                            variant="primary"
                            onClick={() => navigate('/signup')}
                        >
                            Go to SignUp Page
                        </Button>
                    </Box>
                </Box>
            </Box>
        </AuthLayout>
    );
};

export default Landing;

