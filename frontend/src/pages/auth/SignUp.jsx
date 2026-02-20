import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthLayout from '../../layout/auth/AuthLayout';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { Box, Typography, Link, IconButton } from '@mui/material';
import logo from '../../assets/images/logo2.png'
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';
import MailOutlineIcon from '@mui/icons-material/MailOutline';
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

const SignUp = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleRegister = () => {
        // Navigate to OTP verification page
        navigate('/verify-otp', { state: { phone: formData.phone, mode: 'signup' } });
    };

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
                        Register for WeighPro
                    </Typography>
                    <Typography variant="subtitle2" sx={{ mb: 4 }}>
                        Create your account to get started with high accuracy weighing management
                    </Typography>
                </Box>

                <Box component="form" noValidate>
                    <Input
                        label="Full Name" // Usually placeholder per screenshot, but reusing label pattern
                        placeholder="Full Name"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleChange}
                        startIcon={<PersonOutlineOutlinedIcon />}
                    />
                    <Input
                        label="Email"
                        placeholder="Enter your Email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        startIcon={<MailOutlineIcon />}
                    />
                    <Input
                        label="Phone Number"
                        placeholder="Enter your Phone Number"
                        name="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={handleChange}
                        startIcon={<PhoneOutlinedIcon />}
                    />
                    <Input
                        label="Password"
                        placeholder="Enter your Password"
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        value={formData.password}
                        onChange={handleChange}
                        startIcon={<LockOutlinedIcon />}
                        endIcon={
                            <IconButton
                                aria-label="toggle password visibility"
                                onClick={() => setShowPassword(!showPassword)}
                                edge="end"
                            >
                                {showPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                        }
                    />
                    <Input
                        label="Confirm Password"
                        placeholder="Confirm your Password"
                        name="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        startIcon={<LockOutlinedIcon />}
                        endIcon={
                            <IconButton
                                aria-label="toggle password visibility"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                edge="end"
                            >
                                {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                        }
                    />

                    <Button
                        onClick={handleRegister}
                        sx={{ mt: 2, mb: 2 }}
                    >
                        Register
                    </Button>

                    <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                            Already have an Account? <Link
                                component="button"
                                variant="body2"
                                onClick={() => navigate('/login')}
                                sx={{ color: 'text.primary', fontWeight: 'bold', textDecoration: 'none' }}
                            >
                                Login
                            </Link>
                        </Typography>
                    </Box>
                </Box>
            </Box>
        </AuthLayout>
    );
};

export default SignUp;
