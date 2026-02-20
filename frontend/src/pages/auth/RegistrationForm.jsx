import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthLayout from '../../layout/auth/AuthLayout';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { Box, Typography, Grid, IconButton, Stack } from '@mui/material';
import logo from '../../assets/images/logo2.png';

// Icons
import CloudUploadOutlinedIcon from '@mui/icons-material/CloudUploadOutlined';
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';
import AccountBalanceOutlinedIcon from '@mui/icons-material/AccountBalanceOutlined'; // Bank
import CreditCardOutlinedIcon from '@mui/icons-material/CreditCardOutlined'; // Account Number
import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined'; // IFSC / PAN
import BusinessOutlinedIcon from '@mui/icons-material/BusinessOutlined'; // Business Name
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined'; // Pin/Location
import FlagOutlinedIcon from '@mui/icons-material/FlagOutlined'; // Landmark
import MapOutlinedIcon from '@mui/icons-material/MapOutlined'; // State
import LocationCityOutlinedIcon from '@mui/icons-material/LocationCityOutlined'; // City
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined'; // Address
import MyLocationIcon from '@mui/icons-material/MyLocation'; // Current Location
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined'; // Document

const SectionHeader = ({ title }) => (
    <Box sx={{ bgcolor: '#F3F4F6', p: 1.5, borderRadius: 1, mb: 2, mt: 3 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'text.primary' }}>
            {title}
        </Typography>
    </Box>
);

const UploadBox = ({ label, subLabel }) => (
    <Box>
        <Typography variant="caption" sx={{ display: 'block', mb: 1, color: 'text.secondary', fontWeight: 500 }}>
            {label}
            {subLabel && <Box component="span" sx={{ color: 'text.disabled', ml: 0.5 }}>{subLabel}</Box>}
        </Typography>
        <Box
            sx={{
                border: '1px dashed #E5E7EB',
                borderRadius: 2,
                p: 3,
                textAlign: 'center',
                cursor: 'pointer',
                bgcolor: 'background.paper',
                '&:hover': { bgcolor: '#F9FAFB', borderColor: 'primary.main' }
            }}
        >
            <DescriptionOutlinedIcon sx={{ color: 'text.secondary', mb: 1, fontSize: 32 }} />
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Click to Upload</Typography>
            <Typography variant="caption" sx={{ color: 'text.disabled' }}>PDF or JPG (max. 10mb)</Typography>
        </Box>
    </Box>
);

const RegistrationForm = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        accountHolder: '',
        bankName: '',
        accountNumber: '',
        ifscCode: '',
        businessName: '',
        panNumber: '',
        pinCode: '',
        landmark: '',
        state: '',
        city: '',
        currentAddress: '',
        permanentAddress: '',
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = () => {
        // Handle registration logic
        console.log('Form Submitted', formData);
        navigate('/dashboard'); // Assuming dashboard exist
    };

    return (
        <AuthLayout maxWidth="800px">
            <Box sx={{ textAlign: 'left', pb: 4 }}>
                <Box sx={{ mb: 3 }}>
                    <Box
                        component="img"
                        src={logo}
                        alt="WeighPro Logo"
                        sx={{ height: 32, mb: 2, display: 'block' }} // Smaller logo as per screen
                        onError={(e) => { e.target.style.display = 'none' }}
                    />
                    <Typography variant="h2" sx={{ mb: 1 }}>
                        Registration Form
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        Users can upload supporting business documents to strengthen verification.
                    </Typography>
                </Box>

                {/* Upload Section */}
                <SectionHeader title="Upload Documents (Optional)" />
                <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                        <UploadBox label="Proof of Business" subLabel="(Rent Agreement or Ownership Document) (Optional)" />
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <UploadBox label="Udyog Aadhar" subLabel="(Optional)" />
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <UploadBox label="GST Number" subLabel="(Optional)" />
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <UploadBox label="Other Document" subLabel="(Optional)" />
                    </Grid>
                </Grid>

                {/* Bank Details */}
                <SectionHeader title="Bank Details" />
                <Grid container spacing={2}>
                    <Grid item xs={12} md={6}>
                        <Input
                            placeholder="Account Holder (Required)*"
                            name="accountHolder"
                            startIcon={<PersonOutlineOutlinedIcon />}
                            value={formData.accountHolder} onChange={handleChange}
                        />
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <Input
                            placeholder="Bank Name (Required)*"
                            name="bankName"
                            startIcon={<AccountBalanceOutlinedIcon />}
                            value={formData.bankName} onChange={handleChange}
                        />
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <Input
                            placeholder="Account Number (Required)*"
                            name="accountNumber"
                            startIcon={<CreditCardOutlinedIcon />}
                            value={formData.accountNumber} onChange={handleChange}
                        />
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <Input
                            placeholder="IFSC Code (Required)*"
                            name="ifscCode"
                            startIcon={<PersonOutlineOutlinedIcon />}
                            value={formData.ifscCode} onChange={handleChange}
                        />
                    </Grid>
                </Grid>

                {/* Business Details */}
                <SectionHeader title="Enter Business Details" />
                <Stack spacing={2}>
                    <Input
                        placeholder="Enter Business Name (Required)*"
                        name="businessName"
                        startIcon={<BusinessOutlinedIcon />}
                        value={formData.businessName} onChange={handleChange}
                    />
                    <Input
                        placeholder="Pan Number (Required)*"
                        name="panNumber"
                        startIcon={<BadgeOutlinedIcon />}
                        value={formData.panNumber} onChange={handleChange}
                    />

                    <Grid container spacing={2}>
                        <Grid item xs={12} md={6}>
                            <Input
                                placeholder="Pin Code (Required)*"
                                name="pinCode"
                                startIcon={<LocationOnOutlinedIcon />}
                                value={formData.pinCode} onChange={handleChange}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <Input
                                placeholder="Landmark"
                                name="landmark"
                                startIcon={<FlagOutlinedIcon />}
                                value={formData.landmark} onChange={handleChange}
                            />
                        </Grid>
                    </Grid>

                    <Grid container spacing={2}>
                        <Grid item xs={12} md={6}>
                            <Input
                                placeholder="State"
                                name="state"
                                startIcon={<MapOutlinedIcon />}
                                value={formData.state} onChange={handleChange}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <Input
                                placeholder="City"
                                name="city"
                                startIcon={<LocationCityOutlinedIcon />}
                                value={formData.city} onChange={handleChange}
                            />
                        </Grid>
                    </Grid>

                    <Input
                        placeholder="Current Address (Required)*"
                        name="currentAddress"
                        startIcon={<HomeOutlinedIcon />}
                        value={formData.currentAddress} onChange={handleChange}
                    />
                    <Input
                        placeholder="Permanent Address (Required)*"
                        name="permanentAddress"
                        startIcon={<HomeOutlinedIcon />}
                        value={formData.permanentAddress} onChange={handleChange}
                    />

                    <Box
                        sx={{
                            border: '1px dashed #BDBDBD',
                            borderRadius: 1,
                            p: 1.5,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'flex-start',
                            cursor: 'pointer',
                            color: 'text.secondary'
                        }}
                    >
                        <MyLocationIcon sx={{ mr: 1.5 }} />
                        <Box>
                            <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'text.primary' }}>
                                Use My Current Location
                            </Typography>
                            <Typography variant="caption">
                                Automatically fill in the address details based on your current location
                            </Typography>
                        </Box>
                    </Box>
                </Stack>

                <Button
                    onClick={handleSubmit}
                    sx={{ mt: 4, mb: 2 }}
                    className="btn-primary" // Ensure styling
                >
                    Register
                </Button>
            </Box>
        </AuthLayout>
    );
};

export default RegistrationForm;
