import { createTheme } from '@mui/material/styles';

const theme = createTheme({
    palette: {
        primary: {
            main: '#0B3D2E', // Primary Green
            contrastText: '#FFFFFF',
        },
        secondary: {
            main: '#9ACD32', // Light Green
            contrastText: '#FFFFFF',
        },
        background: {
            default: '#FFFFFF',
            paper: '#FFFFFF',
        },
        text: {
            primary: '#1F2937',
            secondary: '#6B7280',
        },
        action: {
            disabledBackground: 'rgba(11, 61, 46, 0.6)',
            disabled: '#FFFFFF',
        },
    },
    typography: {
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        h1: {
            fontFamily: "'Geist Sans', sans-serif",
            fontWeight: 700,
            fontSize: '30px',
            lineHeight: 1.2,
        },
        h2: {
            fontFamily: "'Geist Sans', sans-serif",
            fontWeight: 700,
            fontSize: '30px',
            color: '#111',
            marginBottom: '0.5rem',
        },
        body1: {
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontSize: '14px',
            lineHeight: 1.6,
        },
        button: {
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontSize: '16px',
            fontWeight: 600,
            textTransform: 'none',
        },
        subtitle1: { // Use for subtext-brand
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontSize: '14px',
            opacity: 0.9,
            lineHeight: 1.6,
        },
        subtitle2: { // Use for subtext-auth
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            fontSize: '14px',
            color: '#6B7280',
        },
    },
    shape: {
        borderRadius: 8,
    },
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: '8px',
                    padding: '0.9rem 1.5rem',
                    boxShadow: 'none',
                    '&:hover': {
                        boxShadow: 'none',
                        transform: 'translateY(-1px)',
                    },
                },
                containedPrimary: {
                    backgroundColor: '#0B3D2E',
                    color: '#FFFFFF',
                    '&:hover': {
                        backgroundColor: '#082F23',
                    },
                },
                outlinedPrimary: { // For secondary variant in your design
                    borderColor: '#0B3D2E',
                    color: '#FFFFFF', // Your CSS had secondary utilizing primary green background logic ? No, wait.
                    // Actually, .btn-secondary in global.css had: background-color: var(--primary-green); color: var(--white);
                    // It seems BOTH buttons were Primary Green background in the latest CSS update (Step 373 -> 379).
                    // Wait, let me check global.css again.
                    // .btn-primary, .btn-secondary { background-color: var(--primary-green); color: white; border: 1px solid var(--primary-green); }
                    // So effectively both are 'contained' primary buttons visually.
                    // I will replicate this behavior.
                },
                // For the "Secondary" variant which typically means outlined:
                // The user's CSS for .btn-secondary was actually identifying it as primary green background.
                // "Both buttons use primary style in the new design".
                // So I will make sure standard Button usage reflects this.
            },
        },
        MuiTextField: {
            styleOverrides: {
                root: {
                    '& .MuiOutlinedInput-root': {
                        borderRadius: '8px',
                        '& fieldset': {
                            borderColor: '#E5E7EB',
                        },
                        '&:hover fieldset': {
                            borderColor: '#E5E7EB',
                        },
                        '&.Mui-focused fieldset': {
                            borderColor: '#0B3D2E',
                            borderWidth: '1px',
                            boxShadow: '0 0 0 3px rgba(11, 61, 46, 0.1)',
                        },
                    },
                    '& .MuiInputBase-input': {
                        padding: '0.75rem 1rem',
                        fontSize: '1rem', // 16px
                    },
                    marginBottom: '1.25rem',
                },
            },
        },
        MuiCheckbox: {
            styleOverrides: {
                root: {
                    color: '#E5E7EB',
                    '&.Mui-checked': {
                        color: '#0B3D2E',
                    },
                },
            },
        },
        MuiCssBaseline: {
            styleOverrides: {
                body: {
                    overflowX: 'hidden', // Prevent horizontal scroll
                }
            }
        }
    },
});

export default theme;
