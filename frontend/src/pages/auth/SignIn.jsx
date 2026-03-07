import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthLayout from '../../layout/auth/AuthLayout';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import logo from '../../assets/images/ERP_Logo2.png';
import { ChevronDown } from 'lucide-react';
import { sendLoginOtpApi } from '../../services/authService';

const SignIn = () => {
    const [phone, setPhone] = useState('');
    const [agreed, setAgreed] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const validatePhone = (phoneNumber) => {
        if (!phoneNumber) return '';
        if (!/^\d{10}$/.test(phoneNumber)) return 'Invalid phone number format.';
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
            // Antigravity requirement: Use precise backend error message below the input
            setError(err.response?.data?.message || 'Failed to send OTP. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <AuthLayout hideLeftPanel={true}>
            <div className="text-left w-full box-border">
                <img
                    src={logo}
                    alt="WeighPro Logo"
                    className="h-18 mb-6 md:mb-4 block"
                    onError={(e) => { e.target.style.display = 'none' }}
                />
                <h2 className="text-[30px] font-['Geist_Sans'] font-bold mb-1 leading-tight text-gray-900">
                    Welcome back,<br />
                    Seller! 🏬
                </h2>
                <p className="text-[14px] font-['Plus_Jakarta_Sans'] font-medium mb-6 text-gray-500">
                    Sign in to manage your shop and orders
                </p>

                <div className="flex flex-col gap-4 w-full">
                    {/* Inline error logic is tied to the Input component. We will pass error to Input. */}
                    <div className="flex flex-col">
                        <Input
                            label="Phone number"
                            placeholder="Enter your number"
                            value={phone}
                            onBlur={handlePhoneBlur}
                            onChange={(e) => {
                                // Allow only numbers, max length 10
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
                                    <span className="text-[15px] font-medium text-gray-900">IN</span>
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
                                By logging in, I agree to <a href="#" className="text-green-900 underline font-semibold hover:text-[#073318] transition-colors">T&C</a> and <a href="#" className="text-green-900 underline font-semibold hover:text-[#073318] transition-colors">Privacy Policy</a>
                            </span>
                        </label>
                    </div>

                    <Button
                        disabled={!phone || !agreed || isLoading || phone.length < 10 || !!error}
                        onClick={handleGetOTP}
                        className="text-[16px] font-['Plus_Jakarta_Sans'] py-3 mt-2"
                    >
                        {isLoading ? 'Sending...' : 'Get OTP'}
                    </Button>
                </div>
            </div>
        </AuthLayout>
    );
};

export default SignIn;
