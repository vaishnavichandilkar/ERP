import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import AuthLayout from '../../layout/auth/AuthLayout';
import Button from '../../components/common/Button';
import { ArrowLeft } from 'lucide-react';
import logo from '../../assets/images/logo2.png';

const VerifyOTP = () => {
    const [otp, setOtp] = useState(new Array(6).fill(''));
    const [timer, setTimer] = useState(60);
    const inputRefs = useRef([]);
    const navigate = useNavigate();
    const location = useLocation();
    const phone = location.state?.phone || 'XXXXXX1234';
    const mode = location.state?.mode || 'login';
    const userId = location.state?.userId;

    useEffect(() => {
        const countdown = setInterval(() => {
            setTimer((prev) => (prev > 0 ? prev - 1 : 0));
        }, 1000);
        return () => clearInterval(countdown);
    }, []);

    const handleChange = (element, index) => {
        if (isNaN(element.value)) return;

        const newOtp = [...otp];
        newOtp[index] = element.value;
        setOtp(newOtp);

        // Focus next input
        if (element.nextSibling && element.value) {
            if (index < 5 && element.value) {
                inputRefs.current[index + 1].focus();
            }
        }
    };

    const handleKeyDown = (e, index) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs.current[index - 1].focus();
        }
    };

    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleVerify = async () => {
        const enteredOtp = otp.join('');
        if (enteredOtp.length < 6) return;

        setIsLoading(true);
        setError('');

        try {
            if (mode === 'signup') {
                const { verifyOnboardingOtpApi, startOnboardingApi } = await import('../../services/onboardingService');
                const response = await verifyOnboardingOtpApi(phone, enteredOtp, userId);
                if (response.accessToken) {
                    localStorage.setItem('token', response.accessToken);
                }

                // Start the onboarding session to get the sessionId
                if (userId) {
                    await startOnboardingApi(userId);
                }

                navigate('/signup?step=1');
            } else {
                const { loginApi } = await import('../../services/authService');
                const response = await loginApi(phone, enteredOtp);
                if (response.accessToken) {
                    localStorage.setItem('token', response.accessToken);
                }
                if (response.user) {
                    localStorage.setItem('user', JSON.stringify(response.user));

                    // Handle strictly DB-managed redirection for sellers
                    if (response.user.role === 'SELLER') {
                        try {
                            const { getProfileApi } = await import('../../services/authService');
                            const freshProfile = await getProfileApi();
                            const status = freshProfile.approvalStatus;
                            const isFirst = freshProfile.isFirstApprovalLogin;

                            // Update local user state from fresh DB response
                            const updatedUser = { ...response.user, approvalStatus: status, isFirstApprovalLogin: isFirst };
                            localStorage.setItem('user', JSON.stringify(updatedUser));

                            // APPROVED Flow
                            if (status === 'APPROVED') {
                                if (isFirst) {
                                    // Redirect to status page to see the "You're all set" celebration screen
                                    navigate('/application-status', {
                                        state: { status, isFirstApprovalLogin: true },
                                        replace: true
                                    });
                                } else {
                                    // Direct to dashboard
                                    navigate('/dashboard', { replace: true });
                                }
                                return;
                            }

                            // PENDING or REJECTED Flow
                            navigate('/application-status', {
                                state: {
                                    status,
                                    rejectionReason: freshProfile.rejectionReason,
                                    isFirstApprovalLogin: isFirst
                                },
                                replace: true
                            });
                            return;
                        } catch (err) {
                            console.error("Failed to fetch DB status during login", err);
                            navigate('/application-status', { replace: true });
                            return;
                        }
                    }
                }
                navigate('/success', { state: { mode } });
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Invalid OTP. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleResend = async () => {
        // Implement resend OTP if needed
    };

    const maskedPhone = `+91 ${phone.replace(/.(?=.{4})/g, 'X')}`;

    return (
        <AuthLayout hideLeftPanel={true}>
            <div className="text-left pt-8 md:pt-0 w-full max-w-sm mx-auto">
                <div className="mb-4">
                    <img
                        src={logo}
                        alt="WeighPro Logo"
                        className="h-10 mb-10 md:mb-4 block"
                        onError={(e) => { e.target.style.display = 'none' }}
                    />
                </div>
                <div className="text-left w-full">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-2 -ml-2 mb-2 text-gray-900 rounded-full hover:bg-gray-100 transition-colors cursor-pointer border-none bg-transparent flex items-center justify-center focus:outline-none"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <h2 className="text-[30px] font-['Geist_Sans'] font-bold mb-2 leading-tight text-gray-900">
                        We've sent a 6-digit OTP
                    </h2>
                    <p className="text-[14px] font-['Plus_Jakarta_Sans'] font-medium mb-8 text-gray-500">
                        to phone number <span className="font-bold">{maskedPhone}</span>
                        {mode === 'signup' && (
                            <button
                                className="text-gray-500 ml-2 underline cursor-pointer text-sm font-medium border-none bg-transparent p-0 inline focus:outline-none"
                                onClick={() => navigate(-1)}
                            >
                                Edit
                            </button>
                        )}
                    </p>

                    <div className="flex justify-between gap-1 sm:gap-4 mb-8">
                        {otp.map((digit, index) => (
                            <input
                                key={index}
                                type="text"
                                maxLength={1}
                                value={digit}
                                ref={(el) => inputRefs.current[index] = el}
                                onChange={(e) => {
                                    handleChange(e.target, index);
                                    if (error) setError('');
                                }}
                                onKeyDown={(e) => handleKeyDown(e, index)}
                                className={`w-10 h-10 sm:w-14 sm:h-14 text-center text-xl sm:text-2xl font-bold border rounded-[8px] bg-white text-gray-900 transition-all duration-300 outline-none
                                    ${error ? 'border-red-500 hover:border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500/20' : 'border-gray-300 focus:border-[#0F3D2E] focus:ring-1 focus:ring-[#0F3D2E]'}
                                `}
                            />
                        ))}
                    </div>

                    <div className="mb-6 text-[14px] font-['Plus_Jakarta_Sans'] text-gray-500">
                        {timer > 0 ? (
                            <span>Didn't receive it? <span className="font-bold">Retry</span> in 00:{timer.toString().padStart(2, '0')}</span>
                        ) : (
                            <button
                                onClick={handleResend}
                                className="bg-transparent border-none text-[#0B3D2E] cursor-pointer font-bold p-0 text-sm no-underline hover:underline focus:outline-none"
                            >
                                Resend OTP
                            </button>
                        )}
                    </div>

                    {error && (
                        <div className="mt-1.5 text-red-500 text-[13px] font-medium animate-in fade-in slide-in-from-top-1 duration-300 mb-4">
                            {error}
                        </div>
                    )}

                    <Button onClick={handleVerify} disabled={isLoading || otp.join('').length < 6} className="text-[16px] font-['Plus_Jakarta_Sans'] py-3 mt-2">
                        {isLoading ? 'Verifying...' : 'Verify'}
                    </Button>
                </div>
            </div>
        </AuthLayout>
    );
};

export default VerifyOTP;

