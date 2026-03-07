import React, { useState, useEffect } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import axios from 'axios';
import { BASE_URL } from '../../constants/apiConstants';

const LanguageGuard = () => {
    const [isLoading, setIsLoading] = useState(true);
    const location = useLocation();

    useEffect(() => {
        const checkServerRestart = async () => {
            console.log('LanguageGuard: Checking server restart...');
            try {
                // Try to get runtime ID from backend
                const response = await axios.get(`${BASE_URL}/system/runtime-id`, { timeout: 3000 });
                const currentRuntimeId = response.data.runtimeId;
                const storedRuntimeId = localStorage.getItem('serverRuntimeId');

                console.log('LanguageGuard: Current Runtime ID:', currentRuntimeId);
                console.log('LanguageGuard: Stored Runtime ID:', storedRuntimeId);

                if (storedRuntimeId && storedRuntimeId !== currentRuntimeId) {
                    console.log('LanguageGuard: Server restart detected! Clearing preferences.');
                    localStorage.removeItem('selectedLanguage');
                    localStorage.removeItem('languageConfirmed');
                }

                localStorage.setItem('serverRuntimeId', currentRuntimeId);
            } catch (error) {
                console.warn('LanguageGuard: Failed to check server runtime ID, continuing with local state.', error.message);
                // We DON'T clear preferences if server is unreachable, to allow offline-ish dev
            } finally {
                setIsLoading(false);
            }
        };

        checkServerRestart();
    }, []);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-screen bg-white text-gray-900 font-sans">
                <div className="flex flex-col items-center">
                    <div className="w-10 h-10 border-4 border-green-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                    <p className="text-lg font-medium">Loading system info...</p>
                </div>
            </div>
        );
    }

    const isLanguageSelected = localStorage.getItem('languageConfirmed') === 'true';
    const isSelectionPage = location.pathname === '/language-selection';

    console.log('LanguageGuard: Status', { isLanguageSelected, isSelectionPage, path: location.pathname });

    // If language is not selected and we're not on the selection page, redirect to selection
    if (!isLanguageSelected && !isSelectionPage) {
        return <Navigate to="/language-selection" replace />;
    }

    // If language is already selected and we try to go to selection page, go to landing
    if (isLanguageSelected && isSelectionPage) {
        return <Navigate to="/landing" replace />;
    }

    return <Outlet context={{ isLanguageSelected }} />;
};

export default LanguageGuard;
