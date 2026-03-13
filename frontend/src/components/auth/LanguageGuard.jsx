import { Navigate, Outlet, useLocation } from 'react-router-dom';

const LanguageGuard = () => {
    const location = useLocation();

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
