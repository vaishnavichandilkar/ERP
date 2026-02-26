import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import AuthLayout from '../../layout/auth/AuthLayout';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { Box, Typography, Checkbox, FormControlLabel, Link, MenuItem } from '@mui/material';
import logo from '../../assets/images/logo2.png';

const FileUploadBox = ({ title, file, onFileChange }) => (
    <Box sx={{ flex: 1, width: '100%' }}>
        <Typography variant="body2" sx={{ mb: 1, color: '#374151', fontSize: '0.875rem' }}>{title}</Typography>
        <Box 
            component="label" 
            sx={{ 
                border: '1px dashed #D1D5DB', 
                borderRadius: '8px', 
                p: 3, 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                justifyContent: 'center', 
                cursor: 'pointer',
                bgcolor: '#FFFFFF',
                minHeight: '120px',
                transition: 'border-color 0.2s',
                '&:hover': {
                    borderColor: 'primary.main',
                }
            }}
        >
            <input type="file" hidden onChange={onFileChange} accept=".pdf,.jpg,.jpeg" />
            <Box component="span" sx={{ color: '#6B7280', mb: 1 }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M14 2H6C4.89543 2 4 2.89543 4 4V20C4 21.1046 4.89543 22 6 22H18C19.1046 22 20 21.1046 20 20V8L14 2Z" stroke="#6B7280" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M14 2V8H20" stroke="#6B7280" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M9 13H15" stroke="#6B7280" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M9 17H13" stroke="#6B7280" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
            </Box>
            <Typography variant="body2" sx={{ color: '#0B3D2E', fontWeight: 600, mb: 0.5, fontSize: '0.875rem' }}>
                {file ? file.name : 'Click to upload'}
            </Typography>
            <Typography variant="caption" sx={{ color: '#9CA3AF', fontSize: '0.75rem' }}>
                PDF or JPG (max. 10MB)
            </Typography>
        </Box>
    </Box>
);

const SignUp = () => {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    
    const [step, setStep] = useState(0);

    useEffect(() => {
        const stepParam = parseInt(searchParams.get('step') || '0', 10);
        setStep(stepParam);
    }, [searchParams]);

    const [formData, setFormData] = useState({
        phone: '',
        agreed: false,
        firstName: '',
        lastName: '',
        email: '',
        udyogAadhar: '',
        gstNumber: '',
        udyogAadharFile: null,
        gstFile: null,
        otherDocFile: null,
        shopName: '',
        address: '',
        village: '',
        pinCode: '',
        district: '',
        state: '',
    });

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
    };

    const handleFileChange = (name, file) => {
        setFormData({ ...formData, [name]: file });
    };

    const handleNext = () => {
        if (step === 0) {
            navigate('/verify-otp', { state: { phone: formData.phone, mode: 'signup' } });
        } else if (step === 1) {
            setSearchParams({ step: '2' });
        } else if (step === 2) {
            setSearchParams({ step: '3' });
        } else if (step === 3) {
            // End of provided steps, navigate to success or next page
            navigate('/success', { state: { mode: 'signup' } });
        }
    };

    return (
        <AuthLayout>
            <Box sx={{ textAlign: 'left', width: '100%', maxWidth: '480px', mx: 'auto' }}>
                {/* Header: Logo and Step Pill */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 6 }}>
                    <Box
                        component="img"
                        src={logo}
                        alt="WeighPro Logo"
                        sx={{ height: 28, display: 'block' }}
                        onError={(e) => { e.target.style.display = 'none' }}
                    />
                    <Box sx={{ bgcolor: '#F3F4F6', color: '#4B5563', px: 2, py: 0.5, borderRadius: '16px', fontSize: '0.875rem', fontWeight: 500 }}>
                        Step 0{step}/04
                    </Box>
                </Box>

                {/* Step Content */}
                {step === 0 && (
                    <Box>
                        <Box sx={{ mb: 4 }}>
                            <Typography variant="h4" sx={{ mb: 1, fontWeight: 700, fontSize: '1.75rem', color: '#111827', lineHeight: 1.2 }}>
                                Create your<br />seller account
                            </Typography>
                            <Typography variant="subtitle2" sx={{ color: '#6B7280', fontSize: '0.875rem' }}>
                                Start receiving farmer orders and grow your shop
                            </Typography>
                        </Box>

                        <Box component="form" noValidate>
                            <Box sx={{ mb: 3 }}>
                                <Input
                                    label="Phone number"
                                    placeholder="Enter your number"
                                    name="phone"
                                    type="tel"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    startIcon={
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, pr: 1.5, mr: 0.5, borderRight: '1px solid #E5E7EB', ml: -1 }}>
                                            <Typography sx={{ color: '#4B5563', fontWeight: 500, fontSize: '0.875rem' }}>IN</Typography>
                                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                                                <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                            </svg>
                                        </Box>
                                    }
                                />
                            </Box>
                            
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
                                <FormControlLabel
                                    control={
                                        <Checkbox
                                            name="agreed"
                                            checked={formData.agreed}
                                            onChange={handleChange}
                                            sx={{
                                                color: '#D1D5DB',
                                                '&.Mui-checked': { color: '#0B3D2E' },
                                                p: 0,
                                                mr: 1
                                            }}
                                        />
                                    }
                                    label={
                                        <Typography variant="body2" sx={{ color: '#6B7280', fontSize: '0.875rem' }}>
                                            By logging in, I agree to <Link href="#" sx={{ color: '#4B5563', textDecoration: 'underline', fontWeight: 500 }}>T&C</Link> and <Link href="#" sx={{ color: '#4B5563', textDecoration: 'underline', fontWeight: 500 }}>Privacy Policy</Link>
                                        </Typography>
                                    }
                                    sx={{ ml: 0, mr: 0 }}
                                />
                            </Box>

                            <Button
                                disabled={!formData.phone || !formData.agreed}
                                onClick={handleNext}
                                sx={{ py: 1.5, fontSize: '1rem', fontWeight: 600, textTransform: 'none', borderRadius: '8px' }}
                            >
                                Get OTP
                            </Button>
                        </Box>
                    </Box>
                )}

                {step === 1 && (
                    <Box>
                        <Box sx={{ mb: 4 }}>
                            <Typography variant="h4" sx={{ mb: 1, fontWeight: 700, fontSize: '1.75rem', color: '#111827', lineHeight: 1.2 }}>
                                Set up your<br />seller profile
                            </Typography>
                            <Typography variant="subtitle2" sx={{ color: '#6B7280', fontSize: '0.875rem' }}>
                                Your journey to easier selling starts here
                            </Typography>
                        </Box>

                        <Box component="form" noValidate>
                            <Box sx={{ mb: 3 }}>
                                <Input
                                    label="First name"
                                    placeholder="Enter your first name"
                                    name="firstName"
                                    value={formData.firstName}
                                    onChange={handleChange}
                                />
                            </Box>
                            <Box sx={{ mb: 3 }}>
                                <Input
                                    label="Last name"
                                    placeholder="Enter your last name"
                                    name="lastName"
                                    value={formData.lastName}
                                    onChange={handleChange}
                                />
                            </Box>
                            <Box sx={{ mb: 4 }}>
                                <Input
                                    label="Email"
                                    placeholder="Enter your email ID"
                                    name="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                />
                            </Box>
                            <Button
                                disabled={!formData.firstName || !formData.lastName || !formData.email}
                                onClick={handleNext}
                                sx={{ py: 1.5, fontSize: '1rem', fontWeight: 600, textTransform: 'none', borderRadius: '8px' }}
                            >
                                Save & Continue
                            </Button>
                        </Box>
                    </Box>
                )}

                {step === 2 && (
                    <Box>
                        <Box sx={{ mb: 4 }}>
                            <Typography variant="h4" sx={{ mb: 1, fontWeight: 700, fontSize: '1.75rem', color: '#111827', lineHeight: 1.2 }}>
                                Tell us about your Business
                            </Typography>
                            <Typography variant="subtitle2" sx={{ color: '#6B7280', fontSize: '0.875rem' }}>
                                We just need a few quick details to confirm your business
                            </Typography>
                        </Box>

                        <Box component="form" noValidate>
                            <Box sx={{ display: 'flex', gap: 2, mb: 3, flexDirection: { xs: 'column', sm: 'row' } }}>
                                <Input
                                    label="Udyog aadhar"
                                    placeholder="Enter your 12 digit udyam registration no."
                                    name="udyogAadhar"
                                    value={formData.udyogAadhar}
                                    onChange={handleChange}
                                />
                                <Input
                                    label="GST number (Optional)"
                                    placeholder="Enter your 15 digit GSTIN"
                                    name="gstNumber"
                                    value={formData.gstNumber}
                                    onChange={handleChange}
                                />
                            </Box>
                            
                            <Box sx={{ display: 'flex', gap: 2, mb: 3, flexDirection: { xs: 'column', sm: 'row' } }}>
                                <FileUploadBox 
                                    title="Upload udyog aadhar certificate" 
                                    file={formData.udyogAadharFile} 
                                    onFileChange={(e) => handleFileChange('udyogAadharFile', e.target.files[0])} 
                                />
                                <FileUploadBox 
                                    title="Upload GST Certificate (Optional)" 
                                    file={formData.gstFile} 
                                    onFileChange={(e) => handleFileChange('gstFile', e.target.files[0])} 
                                />
                            </Box>
                            
                            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 4 }}>
                                <Box sx={{ width: { xs: '100%', sm: '60%' } }}>
                                    <FileUploadBox 
                                        title="Upload other document (Optional)" 
                                        file={formData.otherDocFile} 
                                        onFileChange={(e) => handleFileChange('otherDocFile', e.target.files[0])} 
                                    />
                                </Box>
                            </Box>
                            
                            <Button
                                disabled={!formData.udyogAadhar}
                                onClick={handleNext}
                                sx={{ py: 1.5, fontSize: '1rem', fontWeight: 600, textTransform: 'none', borderRadius: '8px' }}
                            >
                                Save & Continue
                            </Button>
                        </Box>
                    </Box>
                )}

                {step === 3 && (
                    <Box>
                        <Box sx={{ mb: 4 }}>
                            <Typography variant="h4" sx={{ mb: 1, fontWeight: 700, fontSize: '1.75rem', color: '#111827', lineHeight: 1.2 }}>
                                Tell us about your Shop
                            </Typography>
                            <Typography variant="subtitle2" sx={{ color: '#6B7280', fontSize: '0.875rem' }}>
                                We just need a few quick details to confirm your business
                            </Typography>
                        </Box>

                        <Box component="form" noValidate>
                            <Box sx={{ display: 'flex', gap: 2, mb: 3, flexDirection: { xs: 'column', sm: 'row' } }}>
                                <Input
                                    label="Shop Name"
                                    placeholder="Enter your shop name"
                                    name="shopName"
                                    value={formData.shopName}
                                    onChange={handleChange}
                                />
                                <Input
                                    label="Address"
                                    placeholder="Enter your address"
                                    name="address"
                                    value={formData.address}
                                    onChange={handleChange}
                                />
                            </Box>
                            
                            <Box sx={{ display: 'flex', gap: 2, mb: 3, flexDirection: { xs: 'column', sm: 'row' } }}>
                                <Input
                                    label="Village"
                                    placeholder="Enter your village name"
                                    name="village"
                                    value={formData.village}
                                    onChange={handleChange}
                                />
                                <Input
                                    label="Pin Code"
                                    placeholder="Enter your pincode"
                                    name="pinCode"
                                    type="text"
                                    value={formData.pinCode}
                                    onChange={handleChange}
                                />
                            </Box>
                            
                            <Box sx={{ display: 'flex', gap: 2, mb: 4, flexDirection: { xs: 'column', sm: 'row' } }}>
                                <Input
                                    select
                                    label="District"
                                    name="district"
                                    value={formData.district}
                                    onChange={handleChange}
                                    SelectProps={{ displayEmpty: true }}
                                >
                                    <MenuItem value="" disabled>Select district</MenuItem>
                                    <MenuItem value="District 1">Kolhapur</MenuItem>
                                    <MenuItem value="District 2">Satara</MenuItem>
                                    <MenuItem value="District 2">Sangli</MenuItem>
                                    <MenuItem value="District 2">Solapur</MenuItem>
                                </Input>
                                <Input
                                    select
                                    label="State"
                                    name="state"
                                    value={formData.state}
                                    onChange={handleChange}
                                    SelectProps={{ displayEmpty: true }}
                                >
                                    <MenuItem value="" disabled>Select state</MenuItem>
                                    <MenuItem value="State 1">Maharastra</MenuItem>
                                    <MenuItem value="State 2">Goa</MenuItem>
                                    <MenuItem value="State 2">Karnataka</MenuItem>
                                    <MenuItem value="State 2">Gujarat</MenuItem>
                                </Input>
                            </Box>
                            
                            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                                <Box sx={{ width: { xs: '100%', sm: '50%' } }}>
                                    <Button
                                        disabled={!formData.shopName || !formData.address || !formData.village || !formData.pinCode || !formData.district || !formData.state}
                                        onClick={handleNext}
                                        sx={{ width: '100%', py: 1.5, fontSize: '1rem', fontWeight: 600, textTransform: 'none', borderRadius: '8px' }}
                                    >
                                        Save & Continue
                                    </Button>
                                </Box>
                            </Box>
                        </Box>
                    </Box>
                )}

            </Box>
        </AuthLayout>
    );
};

export default SignUp;
