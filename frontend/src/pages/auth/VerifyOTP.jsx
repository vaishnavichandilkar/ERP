import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import AuthLayout from '../../layout/auth/AuthLayout';
import Button from '../../components/common/Button';
import { Box, Typography, TextField, Stack, IconButton } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import logo from '../../assets/images/logo2.png';

const VerifyOTP = () => {
    const [otp, setOtp] = useState(new Array(6).fill(''));
    const [timer, setTimer] = useState(60);
    const inputRefs = useRef([]);
    const navigate = useNavigate();
    const location = useLocation();
    const phone = location.state?.phone || 'XXXXXX1234';
    const mode = location.state?.mode || 'login';

    useEffect(() => {
        const countdown = setInterval(() => {
            setTimer((prev) => (prev > 0 ? prev - 1 : 0));
        }, 1000);
        return () => clearInterval(countdown);
    }, []);

    const handleChange = (element, index) => {
        if (isNaN(element.value)) return;

        const newOtp = [...otp];
        newOtp[index] = element.value;
        setOtp(newOtp);

        // Focus next input
        if (element.nextSibling && element.value) {
            // With MUI TextField, nextSibling might be the next root div. 
            // Better to use refs which we are already doing.
            if (index < 5 && element.value) {
                inputRefs.current[index + 1].focus();
            }
        }
    };

    const handleKeyDown = (e, index) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs.current[index - 1].focus();
        }
    };

    const handleVerify = () => {
        if (mode === 'signup') {
            navigate('/signup?step=1');
        } else {
            navigate('/success', { state: { mode } });
        }
    };

    const maskedPhone = `+91 ${phone.replace(/.(?=.{4})/g, 'X')}`;

    return (
        <AuthLayout hideLeftPanel={true}>
            <Box sx={{ textAlign: 'left', pt: { xs: 4, md: 0 } }}>
                <Box sx={{ mb: 2 }}>
                    <Box
                        component="img"
                        src={logo}
                        alt="WeighPro Logo"
                        sx={{ height: 40, mb: { xs: 5, md: 2 }, display: 'block' }}
                        onError={(e) => { e.target.style.display = 'none' }}
                    />
                </Box>
                <Box sx={{ textAlign: 'left' }}>
                    <IconButton onClick={() => navigate(-1)} sx={{ ml: -1, mb: 1, p: 1, color: 'text.primary' }}>
                        <ArrowBackIcon sx={{ fontSize: '1.25rem' }} />
                    </IconButton>
                    <Typography variant="h2" sx={{ mb: 1 }}>
                        We've sent a 6-digit OTP
                    </Typography>
                    <Typography variant="subtitle2" sx={{ mb: 4 }}>
                        to phone number <Box component="span" sx={{ fontWeight: 'bold' }}>{maskedPhone}</Box>
                        {mode === 'signup' && (
                            <Box
                                component="span"
                                sx={{ color: 'text.secondary', ml: 1, textDecoration: 'underline', cursor: 'pointer', fontSize: '0.875rem' }}
                                onClick={() => navigate(-1)}
                            >
                                Edit
                            </Box>
                        )}
                    </Typography>

                    <Box sx={{ display: 'flex', gap: 1.5, justifyContent: 'space-between', mb: 3 }}>
                        {otp.map((data, index) => (
                            <TextField
                                key={index}
                                inputRef={(el) => inputRefs.current[index] = el}
                                value={data}
                                onChange={(e) => {
                                    if (e.target.value.length <= 1) {
                                        handleChange(e.target, index)
                                    }
                                }}
                                onKeyDown={(e) => handleKeyDown(e, index)}
                                onFocus={(e) => e.target.select()}
                                inputProps={{
                                    maxLength: 1,
                                    style: { textAlign: 'center', fontSize: '1.5rem', padding: '0.75rem' }
                                }}
                                sx={{
                                    width: '3rem',
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: '8px',
                                        height: '3.5rem',
                                        '& fieldset': { borderColor: '#E5E7EB' },
                                        '&:hover fieldset': { borderColor: '#E5E7EB' },
                                        '&.Mui-focused fieldset': { borderColor: 'primary.main', borderWidth: '1px' },
                                    }
                                }}
                            />
                        ))}
                    </Box>

                    <Box sx={{ mb: 3, fontSize: '0.875rem', color: 'text.secondary' }}>
                        {timer > 0 ? (
                            <span>Didn't receive it? <Box component="span" sx={{ fontWeight: 'bold' }}>Retry</Box> in 00:{timer.toString().padStart(2, '0')}</span>
                        ) : (
                            <Box
                                component="button"
                                onClick={() => setTimer(60)}
                                sx={{
                                    background: 'none',
                                    border: 'none',
                                    color: 'primary.main',
                                    cursor: 'pointer',
                                    fontWeight: 'bold',
                                    p: 0,
                                    fontSize: 'inherit',
                                    textDecoration: 'none'
                                }}
                            >
                                Resend OTP
                            </Box>
                        )}
                    </Box>

                    <Button onClick={handleVerify}>
                        Verify
                    </Button>
                </Box>
            </Box>
        </AuthLayout>
    );
};

export default VerifyOTP;

