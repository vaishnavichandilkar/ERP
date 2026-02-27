import React from 'react';
import illustration from '../../assets/images/waighingscale1.png';
import { Box, Typography, Grid, Stack } from '@mui/material';

const AuthLayout = ({ children, maxWidth = '480px', hideLeftPanel = false }) => {
    return (
        <Grid container sx={{ height: { xs: 'auto', md: '100vh' }, minHeight: '100vh', width: '100%', overflow: { md: 'hidden', xs: 'auto' } }}>
            {/* Left Panel - Fixed */}
            <Grid
                item
                xs={12}
                md={4}
                sx={{
                    width: { xs: '100%', md: '33.05%' },
                    flexBasis: { xs: '100%', md: '33.05%' },
                    maxWidth: { xs: '100%', md: '33.05%' },
                    height: { xs: 'auto', md: '100%' }, // Full height on desktop, auto on mobile
                    background: 'linear-gradient(135deg, #9ACD32 0%, #0B3D2E 100%)',
                    display: { xs: hideLeftPanel ? 'none' : 'flex', md: 'flex' },
                    flexDirection: 'column',
                    justifyContent: 'center',
                    padding: { xs: '2rem', md: '2rem 3rem' },
                    color: 'common.white',
                    position: 'relative',
                    overflow: 'hidden',
                }}
            >
                <Box sx={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <Typography variant="h1" className="heading-brand" sx={{ mb: 2, color: 'inherit' }}>
                        Enterprise-grade <Box component="span" sx={{ bgcolor: '#073318', px: 0.5, borderRadius: '4px' }}>accuracy</Box><br />
                        for critical<br />
                        <Box component="span" sx={{ bgcolor: '#073318', px: 0.5, borderRadius: '4px' }}>Weighing</Box> operations
                    </Typography>

                    <Typography variant="subtitle1" className="subtext-brand" sx={{ mb: 4, maxWidth: '90%', color: 'inherit' }}>
                        A reliable weighing management solution built to deliver precise measurements, secure data handling, and operational efficiency across business and industrial environments.
                    </Typography>

                    {/* Illustration */}
                    <Box
                        component="img"
                        src={illustration}
                        alt="Weighing Illustration"
                        sx={{
                            marginTop: 'auto',
                            width: '100%', // Responsive
                            height: 'auto',
                            maxWidth: '100%',
                            filter: 'drop-shadow(0 10px 15px rgba(0, 0, 0, 0.2))',
                            display: 'block'
                        }}
                    />
                </Box>
            </Grid>

            {/* Right Panel - Scrollable */}
            <Grid
                item
                xs={12}
                md={8}
                sx={{
                    width: { xs: '100%', md: '66.95%' },
                    flexBasis: { xs: '100%', md: '66.95%' },
                    maxWidth: { xs: '100%', md: '66.95%' },
                    height: { xs: 'auto', md: '100%' }, // Responsive height
                    overflowY: { xs: 'visible', md: 'auto' }, // visible on mobile to allow page scroll
                    bgcolor: 'background.default',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                }}
            >
                <Box
                    sx={{
                        width: '100%',
                        maxWidth: { xs: '100%', md: maxWidth },
                        p: { xs: 2, md: 4 },
                        boxSizing: 'border-box',
                        flexGrow: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        minHeight: 'min-content'
                    }}
                >
                    {children}
                </Box>
            </Grid>
        </Grid>
    );
};

export default AuthLayout;

