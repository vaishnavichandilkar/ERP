import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import AuthLayout from '../../layout/auth/AuthLayout';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { Box, Typography, Checkbox, FormControlLabel, Link, MenuItem } from '@mui/material';
import logo from '../../assets/images/logo2.png';

const FileUploadBox = ({ title, file, onFileChange, onRemove }) => {
    const [progress, setProgress] = React.useState(0);

    React.useEffect(() => {
        if (file) {
            setProgress(0);
            const interval = setInterval(() => {
                setProgress(prev => {
                    if (prev >= 100) {
                        clearInterval(interval);
                        return 100;
                    }
                    return prev + 20;
                });
            }, 300);
            return () => clearInterval(interval);
        } else {
            setProgress(0);
        }
    }, [file]);

    const handleRemove = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (onRemove) onRemove();
    };

    if (file) {
        return (
            <Box sx={{ flex: 1, width: '100%' }}>
                <Typography variant="body2" sx={{ mb: 1, color: '#374151', fontSize: '0.875rem' }}>{title}</Typography>
                <Box sx={{ 
                    border: '1px solid #E5E7EB', 
                    borderRadius: '8px', 
                    p: 2, 
                    bgcolor: '#FFFFFF',
                    minHeight: '120px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center'
                }}>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: progress < 100 ? 2 : 0 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 28, height: 32, border: '1.5px solid #EF4444', borderRadius: '4px', position: 'relative' }}>
                                <Typography sx={{ fontSize: '0.55rem', color: '#EF4444', fontWeight: 800, bgcolor: '#FFFFFF', px: 0.5, position: 'absolute', bottom: -6 }}>PDF</Typography>
                            </Box>
                            <Box>
                                <Typography variant="body2" sx={{ color: '#111827', fontWeight: 500, fontSize: '0.875rem' }}>
                                    {file.name}
                                </Typography>
                                {progress < 100 && (
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
                                        <Typography variant="caption" sx={{ color: '#6B7280', fontSize: '0.75rem' }}>
                                            {Math.round((file.size || 204800) * progress / 100 / 1024)} kb of {Math.round((file.size || 204800) / 1024)} KB
                                        </Typography>
                                        <Typography variant="caption" sx={{ color: '#6B7280', fontSize: '0.75rem' }}>•</Typography>
                                        <Typography variant="caption" sx={{ color: '#6B7280', fontSize: '0.75rem' }}>
                                            Uploading...
                                        </Typography>
                                    </Box>
                                )}
                            </Box>
                        </Box>
                        <Box sx={{ display: 'flex', gap: 1.5, color: '#6B7280', pt: 0.5 }}>
                            <Box component="label" sx={{ cursor: 'pointer', display: 'flex', alignItems: 'center', color: '#4B5563', '&:hover': { color: '#111827' } }}>
                                <input type="file" hidden onChange={onFileChange} accept=".pdf,.jpg,.jpeg" />
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                    <polyline points="17 8 12 3 7 8" />
                                    <line x1="12" y1="3" x2="12" y2="15" />
                                </svg>
                            </Box>
                            <Box component="span" onClick={handleRemove} sx={{ cursor: 'pointer', color: '#EF4444', display: 'flex', alignItems: 'center', '&:hover': { color: '#dc2626' } }}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="3 6 5 6 21 6" />
                                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                    <line x1="10" y1="11" x2="10" y2="17" />
                                    <line x1="14" y1="11" x2="14" y2="17" />
                                </svg>
                            </Box>
                        </Box>
                    </Box>
                    
                    {progress < 100 && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 1 }}>
                            <Box sx={{ flex: 1, height: '4px', bgcolor: '#F3F4F6', borderRadius: '2px', overflow: 'hidden' }}>
                                <Box sx={{ height: '100%', bgcolor: '#0B3D2E', width: `${progress}%`, transition: 'width 0.3s' }} />
                            </Box>
                            <Typography variant="caption" sx={{ color: '#0B3D2E', fontWeight: 600 }}>{progress}%</Typography>
                        </Box>
                    )}
                </Box>
            </Box>
        );
    }

    return (
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
                    Click to upload
                </Typography>
                <Typography variant="caption" sx={{ color: '#9CA3AF', fontSize: '0.75rem' }}>
                    PDF or JPG (max. 10MB)
                </Typography>
            </Box>
        </Box>
    );
};

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
        accountHolderName: '',
        accountNumber: '',
        ifscCode: '',
        bankName: '',
        cancelledChequeFile: null,
        panCardFile: null,
    });

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
    };

    const handleFileChange = (name, file) => {
        setFormData({ ...formData, [name]: file });
    };

    const handleFileRemove = (name) => {
        setFormData({ ...formData, [name]: null });
    };

    const handleNext = () => {
        if (step === 0) {
            navigate('/verify-otp', { state: { phone: formData.phone, mode: 'signup' } });
        } else if (step === 1) {
            setSearchParams({ step: '2' });
        } else if (step === 2) {
            setSearchParams({ step: '3' });
        } else if (step === 3) {
            setSearchParams({ step: '4' });
        } else if (step === 4) {
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
                            <Box sx={{ display: 'flex', gap: '24px', mb: '24px', flexDirection: { xs: 'column', sm: 'row' } }}>
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
                            
                            <Box sx={{ display: 'flex', gap: '24px', mb: '24px', flexDirection: { xs: 'column', sm: 'row' } }}>
                                <FileUploadBox 
                                    title="Upload udyog aadhar certificate" 
                                    file={formData.udyogAadharFile} 
                                    onFileChange={(e) => handleFileChange('udyogAadharFile', e.target.files[0])} 
                                    onRemove={() => handleFileRemove('udyogAadharFile')}
                                />
                                <FileUploadBox 
                                    title="Upload GST Certificate (Optional)" 
                                    file={formData.gstFile} 
                                    onFileChange={(e) => handleFileChange('gstFile', e.target.files[0])} 
                                    onRemove={() => handleFileRemove('gstFile')}
                                />
                            </Box>
                            
                            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 4 }}>
                                <Box sx={{ width: { xs: '100%', sm: '60%' } }}>
                                    <FileUploadBox 
                                        title="Upload other document (Optional)" 
                                        file={formData.otherDocFile} 
                                        onFileChange={(e) => handleFileChange('otherDocFile', e.target.files[0])} 
                                        onRemove={() => handleFileRemove('otherDocFile')}
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
                            <Box sx={{ display: 'flex', gap: '24px', mb: '24px', flexDirection: { xs: 'column', sm: 'row' } }}>
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
                            
                            <Box sx={{ display: 'flex', gap: '24px', mb: '24px', flexDirection: { xs: 'column', sm: 'row' } }}>
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

                {step === 4 && (
                    <Box>
                        <Box sx={{ mb: 4 }}>
                            <Typography variant="h4" sx={{ mb: 1, fontWeight: 700, fontSize: '1.75rem', color: '#111827', lineHeight: 1.2 }}>
                                Add your bank details
                            </Typography>
                            <Typography variant="subtitle2" sx={{ color: '#6B7280', fontSize: '0.875rem' }}>
                                So we can send your payments on time, we need your correct bank account details
                            </Typography>
                        </Box>

                        <Box component="form" noValidate>
                            <Box sx={{ display: 'flex', gap: '24px', mb: '24px', flexDirection: { xs: 'column', sm: 'row' } }}>
                                <Input
                                    label="Account holder name"
                                    placeholder="Enter your account holder name"
                                    name="accountHolderName"
                                    value={formData.accountHolderName}
                                    onChange={handleChange}
                                />
                                <Input
                                    label="Account number"
                                    placeholder="Enter your account number"
                                    name="accountNumber"
                                    value={formData.accountNumber}
                                    onChange={handleChange}
                                />
                            </Box>
                            
                            <Box sx={{ display: 'flex', gap: '24px', mb: '24px', flexDirection: { xs: 'column', sm: 'row' } }}>
                                <Input
                                    label="IFSC code"
                                    placeholder="Enter your IFSC code"
                                    name="ifscCode"
                                    value={formData.ifscCode}
                                    onChange={handleChange}
                                />
                                <Input
                                    select
                                    label="Bank name"
                                    name="bankName"
                                    value={formData.bankName}
                                    onChange={handleChange}
                                    SelectProps={{ displayEmpty: true }}
                                >
                                    <MenuItem value="" disabled>Select bank</MenuItem>
                                    <MenuItem value="ICICI Bank">ICICI Bank</MenuItem>
                                    <MenuItem value="ICICI Bank">Bank of India</MenuItem>
                                    <MenuItem value="HDFC Bank">HDFC Bank</MenuItem>
                                    <MenuItem value="State Bank of India">State Bank of India</MenuItem>
                                    <MenuItem value="Axis Bank">Axis Bank</MenuItem>
                                    <MenuItem value="Kotak Mahindra Bank">Kotak Mahindra Bank</MenuItem>
                                </Input>
                            </Box>
                            
                            <Box sx={{ display: 'flex', gap: 2, mb: 4, flexDirection: { xs: 'column', sm: 'row' } }}>
                                <FileUploadBox 
                                    title="Upload Cancelled Cheque" 
                                    file={formData.cancelledChequeFile} 
                                    onFileChange={(e) => handleFileChange('cancelledChequeFile', e.target.files[0])} 
                                    onRemove={() => handleFileRemove('cancelledChequeFile')}
                                />
                                <FileUploadBox 
                                    title="Upload PAN Card (Optional)" 
                                    file={formData.panCardFile} 
                                    onFileChange={(e) => handleFileChange('panCardFile', e.target.files[0])} 
                                    onRemove={() => handleFileRemove('panCardFile')}
                                />
                            </Box>
                            
                            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                                <Box sx={{ width: { xs: '100%', sm: '50%' } }}>
                                    <Button
                                        disabled={!formData.accountHolderName || !formData.accountNumber || !formData.ifscCode || !formData.bankName || !formData.cancelledChequeFile}
                                        onClick={handleNext}
                                        sx={{ 
                                            width: '100%', 
                                            py: 1.5, 
                                            fontSize: '1rem', 
                                            fontWeight: 600, 
                                            textTransform: 'none', 
                                            borderRadius: '8px',
                                            bgcolor: (!formData.accountHolderName || !formData.accountNumber || !formData.ifscCode || !formData.bankName || !formData.cancelledChequeFile) ? '#A7C0B8' : '#0B3D2E',
                                            color: '#FFFFFF',
                                            '&:disabled': {
                                                bgcolor: '#A7C0B8',
                                                color: '#FFFFFF'
                                            },
                                            '&:hover': {
                                                bgcolor: (!formData.accountHolderName || !formData.accountNumber || !formData.ifscCode || !formData.bankName || !formData.cancelledChequeFile) ? '#A7C0B8' : '#092E22',
                                            }
                                        }}
                                    >
                                        {(!formData.accountHolderName || !formData.accountNumber || !formData.ifscCode || !formData.bankName || !formData.cancelledChequeFile) ? "Save & Continue" : "Save & Finish"}
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
