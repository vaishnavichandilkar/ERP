import React from 'react';

// Mock Toaster component
export const Toaster = () => {
    return <div id="mock-toaster" style={{ display: 'none' }}>Toaster Mock</div>;
};

// Mock toast object
export const toast = {
    success: (msg) => {
        console.log('SUCCESS:', msg);
    },
    error: (msg) => {
        console.error('ERROR:', msg);
    },
    loading: (msg) => console.log('LOADING:', msg),
    dismiss: (id) => console.log('DISMISS:', id),
};

export default toast;
