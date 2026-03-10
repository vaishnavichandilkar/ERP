import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import AuthLayout from '../../layout/auth/AuthLayout';
import Button from '../../components/common/Button';
import logo from '../../assets/images/Verified_logo.png';

const Success = () => {
    const { t } = useTranslation(['auth', 'common']);
    const navigate = useNavigate();
    const location = useLocation();
    const mode = location.state?.mode || 'login';

    const handleNavigation = () => {
        if (mode === 'signup') {
            navigate('/', { state: { registered: true } });
        } else {
            navigate('/dashboard');
        }
    };

    return (
        <AuthLayout hideLeftPanel={true}>
            <div className="text-center pt-8 md:pt-0 w-full max-w-sm mx-auto">
                <img
                    src={logo}
                    alt="Verified Logo"
                    className="h-[90px] mb-10 md:mb-4 block pl-8"
                    onError={(e) => { e.target.style.display = 'none' }}
                />

                <h2 className="text-[30px] font-['Geist_Sans'] font-bold mb-2 leading-tight text-gray-900">
                    {t('auth:successfully_verified')}
                </h2>

                <p className="text-[14px] font-['Plus_Jakarta_Sans'] font-medium mb-8 text-gray-500">
                    {t('auth:reg_verification_complete', {
                        type: mode === 'signup'
                            ? t('auth:registration')
                            : t('auth:login_verification')
                    })}
                </p>

                <Button onClick={handleNavigation} className="text-[16px] font-['Plus_Jakarta_Sans'] py-3 px-6 mt-4">
                    {t('common:continue')}
                </Button>
            </div>
        </AuthLayout>
    );
};

export default Success;
