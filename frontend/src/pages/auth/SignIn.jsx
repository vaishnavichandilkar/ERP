import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthLayout from '../../layout/auth/AuthLayout';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import LanguageSwitcher from '../../components/common/LanguageSwitcher';
import logo from '../../assets/images/ERP_Logo2.png';
import { ChevronDown, ArrowLeft } from 'lucide-react';
import { sendLoginOtpApi } from '../../services/authService';
import { useTranslation } from 'react-i18next';

const SignIn = () => {
    const { t } = useTranslation('auth');
    const [phone, setPhone] = useState('');
    const [agreed, setAgreed] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const validatePhone = (phoneNumber) => {
        if (!phoneNumber) return '';
        if (!/^\d{10}$/.test(phoneNumber)) return t('invalid_phone');
        return '';
    };

    const handlePhoneBlur = () => {
        const validationError = validatePhone(phone);
        if (validationError) {
            setError(validationError);
        }
    };

    const handleGetOTP = async () => {
        const validationError = validatePhone(phone);
        if (validationError) {
            setError(validationError);
            return;
        }

        setIsLoading(true);
        setError('');
        try {
            await sendLoginOtpApi(phone);
            navigate('/verify-otp', { state: { phone, mode: 'login' } });
        } catch (err) {
            setError(err.response?.data?.message || t('otp_failed'));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AuthLayout hideLeftPanel={true}>
            <div className="relative text-left w-full box-border flex flex-col pt-0">
                <button
                    onClick={() => navigate(-1)}
                    className="p-2 -ml-2 mb-4 text-gray-900 rounded-full hover:bg-gray-100 transition-colors cursor-pointer border-none bg-transparent flex items-center justify-center self-start focus:outline-none"
                >
                    <ArrowLeft size={20} />
                </button>

                {/* Language Switcher for Auth Screens */}
                {!localStorage.getItem('languageConfirmed') && (
                    <div className="absolute top-2 right-0">
                        <LanguageSwitcher />
                    </div>
                )}

                <img
                    src={logo}
                    alt="WeighPro Logo"
                    className="h-18 w-auto mb-2 md:mb-4 block object-contain self-start"
                    onError={(e) => { e.target.style.display = 'none' }}
                />
                <h2 className="text-[30px] font-['Geist_Sans'] font-bold mb-1 leading-tight text-gray-900">
                    {t('welcome_back')}<br />
                    {t('user_suffix')}
                </h2>
                <p className="text-[14px] font-['Plus_Jakarta_Sans'] font-medium mb-6 text-gray-500">
                    {t('signin_desc')}
                </p>

                <div className="flex flex-col gap-4 w-full">
                    <div className="flex flex-col">
                        <Input
                            label={t('phone_number')}
                            placeholder={t('enter_number')}
                            value={phone}
                            onBlur={handlePhoneBlur}
                            onChange={(e) => {
                                const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                                setPhone(val);
                                if (error) {
                                    const validationError = validatePhone(val);
                                    if (!validationError) {
                                        setError('');
                                    }
                                }
                            }}
                            type="tel"
                            invalid={!!error}
                            prefix={
                                <div className="flex items-center gap-1.5 cursor-pointer hover:bg-gray-50 rounded-l-[8px] h-full">
                                    <span className="text-[15px] font-medium text-gray-900">{t('in')}</span>
                                    <ChevronDown size={14} className="text-gray-500" strokeWidth={2} />
                                </div>
                            }
                        />
                        {error && (
                            <div className="mt-1.5 text-red-500 text-[13px] font-medium animate-in fade-in slide-in-from-top-1 duration-300">
                                {error}
                            </div>
                        )}
                    </div>

                    <div className="flex items-start">
                        <label className="flex items-start cursor-pointer">
                            <input
                                type="checkbox"
                                checked={agreed}
                                onChange={(e) => setAgreed(e.target.checked)}
                                className="mt-1 mr-2 px-0 text-[#0B3D2E] rounded border-gray-300 focus:ring-[#0B3D2E]"
                            />
                            <span className="text-[14px] font-['Plus_Jakarta_Sans'] text-gray-500">
                                {t('agree_prefix')} <a href="#" className="text-green-900 underline font-semibold hover:text-[#073318] transition-colors">{t('tc')}</a> {t('and')} <a href="#" className="text-green-900 underline font-semibold hover:text-[#073318] transition-colors">{t('privacy_policy')}</a> {t('agree_suffix')}
                            </span>
                        </label>
                    </div>

                    <Button
                        disabled={!phone || !agreed || isLoading || phone.length < 10 || !!error}
                        onClick={handleGetOTP}
                        className="text-[16px] font-['Plus_Jakarta_Sans'] py-3 mt-2"
                    >
                        {isLoading ? t('sending') : t('get_otp')}
                    </Button>
                </div>
            </div>
        </AuthLayout>
    );
};


export default SignIn;
