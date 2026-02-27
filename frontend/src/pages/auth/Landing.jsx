import React from 'react';
import { useNavigate } from 'react-router-dom';
import AuthLayout from '../../layout/auth/AuthLayout';
import Button from '../../components/common/Button';
import logo from '../../assets/images/logo2.png';
import { Box, Typography, Stack, Divider } from '@mui/material';

const Landing = () => {
    const navigate = useNavigate();

    return (
        <AuthLayout hideLeftPanel={true}>
            <Box sx={{ textAlign: 'left', width: '100%', boxSizing: 'border-box' }}>
                <Box sx={{ mb: { xs: 3, md: 2 } }}>
                    <Box
                        component="img"
                        src={logo}
                        alt="WeighPro Logo"
                        sx={{ height: 40, mb: 1.5, display: 'block' }}
                        onError={(e) => { e.target.style.display = 'none' }}
                    />

                    <Typography variant="h2" sx={{ mb: 0.5 }}>
                        Welcome to WeighPro
                    </Typography>
                    <Typography variant="subtitle2" sx={{ mb: 3 }}>
                        Login or create an account to continue
                    </Typography>
                </Box>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: { xs: 1.5, md: 2 } }}>
                    <Typography variant="body1" sx={{ fontWeight: 600, color: 'text.primary', mb: 1, textAlign: 'center', display: 'block' }}>
                        Are you a GramUnati User?
                    </Typography>

                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, width: '100%' }}>
                        <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500, mb: 0 }}>
                            Yes, I am a GramUnati user
                        </Typography>
                        <Button
                            variant="primary"
                            onClick={() => navigate('/login')}
                            fullWidth
                            sx={{ py: 1.5 }}
                        >
                            Go to Login Page
                        </Button>
                    </Box>

                    <Divider sx={{ my: { xs: 1.5, md: 2 }, color: '#9CA3AF', fontWeight: 500, fontSize: '14px', '&::before, &::after': { borderColor: '#E5E7EB' } }}>
                        OR
                    </Divider>

                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, width: '100%' }}>
                        <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500, mb: 0 }}>
                            No, I am a new user
                        </Typography>
                        <Button
                            variant="primary"
                            onClick={() => navigate('/signup')}
                            fullWidth
                            sx={{ py: 1.5 }}
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

