import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import AuthLayout from '../../layout/auth/AuthLayout';
import Button from '../../components/common/Button';
import { CheckCircle2, X, ArrowLeft } from 'lucide-react';
import logo from '../../assets/images/ERP_Logo2.png';

const Landing = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const location = useLocation();
    const [showPopup, setShowPopup] = useState(false);

    useEffect(() => {
        if (location.state?.registered) {
            setShowPopup(true);
            window.history.replaceState({}, document.title);

            const timer = setTimeout(() => {
                setShowPopup(false);
            }, 14000);
            return () => clearTimeout(timer);
        }
    }, [location]);

    const handleBackToLanguage = () => {
        localStorage.removeItem('languageConfirmed');
        navigate('/language-selection');
    };

    return (
        <AuthLayout>
            {/* Success Popup */}
            {showPopup && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl shadow-2xl w-[420px] max-w-[90vw] p-8 text-center relative animate-in fade-in zoom-in duration-300">
                        <button
                            onClick={() => setShowPopup(false)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <div className="flex justify-center mb-4">
                            <CheckCircle2 className="w-16 h-16 text-green-500" />
                        </div>

                        <h2 className="text-2xl font-bold text-gray-900 mb-2 font-['Geist_Sans']">
                            Congratulations!
                        </h2>

                        <p className="text-gray-600 text-[15px] font-['Plus_Jakarta_Sans'] mb-6">
                            Your account has been successfully registered.
                            You can now login and start using WeighPro.
                        </p>

                        <Button
                            variant="primary"
                            onClick={() => navigate('/login')}
                            className="w-full py-3 text-[16px] font-semibold"
                        >
                            Go to Login
                        </Button>
                    </div>
                </div>
            )}

            <div className="text-left w-full box-border pt-4">
                {/* Back Button */}
                <button
                    onClick={handleBackToLanguage}
                    className="flex items-center text-gray-500 hover:text-gray-800 transition-colors mb-6 group"
                >
                    <ArrowLeft className="w-5 h-5 mr-2" />
                </button>

                <div className="mb-6 md:mb-4">
                    <img
                        src={logo}
                        alt="ERP Logo"
                        className="h-18 mb-3 block pl-0 ml-0"
                        style={{ paddingLeft: '0px', marginLeft: '0px' }}
                        onError={(e) => { e.target.style.display = 'none' }}
                    />

                    <h2 className="text-[30px] font-['Geist_Sans'] font-bold leading-tight mb-1 text-gray-900">
                        {t('landing.welcome')}
                    </h2>
                    <p className="text-[14px] font-['Plus_Jakarta_Sans'] font-medium text-gray-500 mb-6">
                        {t('landing.subtext')}
                    </p>
                </div>

                <div className="flex flex-col gap-3 md:gap-4">
                    <p className="text-[14px] font-['Plus_Jakarta_Sans'] font-semibold text-gray-900 mb-2 text-center block">
                        {t('landing.question')}
                    </p>

                    <div className="flex flex-col gap-2 w-full">
                        <p className="text-[14px] font-['Plus_Jakarta_Sans'] font-medium text-gray-500 m-0">
                            {t('landing.yes_label')}
                        </p>
                        <Button
                            variant="primary"
                            onClick={() => navigate('/login')}
                            className="text-[16px] font-['Plus_Jakarta_Sans'] py-3"
                        >
                            {t('landing.go_to_login')}
                        </Button>
                    </div>

                    <div className="flex items-center my-3 md:my-4">
                        <div className="flex-1 border-t border-gray-200"></div>
                        <span className="px-4 text-[14px] font-['Plus_Jakarta_Sans'] font-medium text-gray-400">
                            {t('landing.or')}
                        </span>
                        <div className="flex-1 border-t border-gray-200"></div>
                    </div>

                    <div className="flex flex-col gap-2 w-full">
                        <p className="text-[14px] font-['Plus_Jakarta_Sans'] font-medium text-gray-500 m-0">
                            {t('landing.no_label')}
                        </p>
                        <Button
                            variant="primary"
                            onClick={() => navigate('/signup')}
                            className="text-[16px] font-['Plus_Jakarta_Sans'] py-3"
                        >
                            {t('landing.go_to_signup')}
                        </Button>
                    </div>
                </div>
            </div>
        </AuthLayout>
    );
};

export default Landing;
