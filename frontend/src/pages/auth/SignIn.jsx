import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthLayout from '../../layout/auth/AuthLayout';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { Box, Typography, Checkbox, FormControlLabel, Link } from '@mui/material';
import logo from '../../assets/images/logo2.png';

const SignIn = () => {
    const [phone, setPhone] = useState('');
    const [agreed, setAgreed] = useState(false);
    const navigate = useNavigate();

    const handleGetOTP = () => {
        navigate('/verify-otp', { state: { phone } });
    };

    return (
        <AuthLayout>
            <Box sx={{ textAlign: 'left' }}>
                <Box
                    component="img"
                    src={logo}
                    alt="WeighPro Logo"
                    sx={{ height: 40, mb: 2, display: 'block' }}
                    onError={(e) => { e.target.style.display = 'none' }}
                />
                <Typography variant="h2" sx={{ mb: 1 }}>
                    Welcome back,<br />
                    Seller! 🏬
                </Typography>
                <Typography variant="subtitle2" sx={{ mb: 4 }}>
                    Sign in to manage your shop and orders
                </Typography>

                <Input
                    label="Phone number"
                    placeholder="Enter your number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    type="tel"
                />

                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={agreed}
                                onChange={(e) => setAgreed(e.target.checked)}
                                sx={{
                                    color: 'text.secondary',
                                    '&.Mui-checked': {
                                        color: 'primary.main',
                                    },
                                    p: 0,
                                    mr: 1
                                }}
                            />
                        }
                        label={
                            <Typography variant="body2" color="text.secondary">
                                By logging in, I agree to<Link href="#" sx={{ color: 'text.secondary', textDecoration: 'underline' }}>T&C</Link> and <Link href="#" sx={{ color: 'text.secondary', textDecoration: 'underline' }}>Privacy Policy</Link>
                            </Typography>
                        }
                        sx={{ ml: 0, mr: 0 }} // Reset default margin
                    />
                </Box>

                <Button
                    disabled={!phone || !agreed}
                    onClick={handleGetOTP}
                >
                    Get OTP
                </Button>
            </Box>
        </AuthLayout>
    );
};

export default SignIn;

