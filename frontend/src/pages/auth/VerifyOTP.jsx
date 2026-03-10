import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import AuthLayout from '../../layout/auth/AuthLayout';
import Button from '../../components/common/Button';
import { ArrowLeft } from 'lucide-react';
import logo from '../../assets/images/ERP_Logo2.png';

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

                if (response.isApproved) {
                    setError('Seller already registered. Please login.');
                    return;
                }

                if (response.accessToken) {
                    localStorage.setItem('token', response.accessToken);
                }

                // Use the returned sessionId if existing, else start new
                if (response.sessionId) {
                    localStorage.setItem('sessionId', response.sessionId);
                } else if (userId) {
                    await startOnboardingApi(userId);
                }

                let frontendStep = 1; // Default to personal details
                if (response.currentStep) {
                    if (response.currentStep === 3) frontendStep = 1;
                    else if (response.currentStep === 4) frontendStep = 2;
                    else if (response.currentStep === 5) frontendStep = 3;
                    else if (response.currentStep >= 6) frontendStep = 4;
                }

                navigate(`/signup?step=${frontendStep}`);
            } else {
                const { loginApi } = await import('../../services/authService');
                const response = await loginApi(phone, enteredOtp);
                if (response.accessToken) {
                    localStorage.setItem('token', response.accessToken);
                }

                let userRole = response.user?.role;
                if (!userRole && response.accessToken) {
                    try {
                        const { jwtDecode } = await import('jwt-decode');
                        const decoded = jwtDecode(response.accessToken);
                        userRole = decoded.role || decoded.userRole;
                    } catch (e) {
                        console.error("Failed to decode token", e);
                    }
                }

                if (response.user) {
                    localStorage.setItem('user', JSON.stringify(response.user));

                    // Stage 3: Sync language from DB
                    if (response.user.selected_language) {
                        const dbLanguage = response.user.selected_language;
                        localStorage.setItem('selectedLanguage', dbLanguage);
                        localStorage.setItem('languageConfirmed', 'true');

                        // Dynamically update i18n
                        import('../../i18n').then(module => {
                            module.default.changeLanguage(dbLanguage);
                        });
                    }
                }

                if (userRole === 'SUPERADMIN' || userRole === 'superadmin') {
                    navigate('/superadmin/dashboard', { replace: true });
                    return;
                }

                // Handle strictly DB-managed redirection for sellers
                if (userRole === 'SELLER' || userRole === 'seller') {
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
                                navigate('/seller/dashboard', { replace: true });
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
            <div className="text-left w-full max-w-[480px] mx-auto flex flex-col justify-center min-h-[100dvh] md:min-h-0 py-8 md:py-0">
                <div className="flex justify-between items-center mb-12 w-full">
                    <img
                        src={logo}
                        alt="WeighPro Logo"
                        className="h-18 block"
                        onError={(e) => { e.target.style.display = 'none' }}
                    />
                    <div className="bg-[#F3F4F6] text-[#374151] px-[12px] py-[6px] rounded-full text-[12px] font-medium">
                        Step 00/04
                    </div>
                </div>
                <div className="text-left w-full mb-8">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-2 -ml-2 mb-2 text-gray-900 rounded-full hover:bg-gray-100 transition-colors cursor-pointer border-none bg-transparent flex items-center justify-center focus:outline-none"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <h2 className="text-[30px] font-['Geist_Sans'] font-bold mb-1 leading-tight text-gray-900">
                        We've sent a 6-digit OTP
                    </h2>
                    <p className="text-[14px] font-['Plus_Jakarta_Sans'] font-medium mb-8 text-gray-500">
                        to <span className="text-black font-semibold">{maskedPhone}</span>
                        <button
                            className="text-[#0F3D2E] ml-1 underline cursor-pointer text-sm font-semibold border-none bg-transparent p-0 inline focus:outline-none hover:text-[#073318] transition-colors"
                            onClick={() => navigate(-1)}
                        >
                            Edit
                        </button>
                    </p>

                    <form noValidate onSubmit={(e) => e.preventDefault()}>
                        <div className="flex gap-2 justify-between mb-6">
                            {otp.map((data, index) => (
                                <input
                                    key={index}
                                    type="text"
                                    ref={(el) => inputRefs.current[index] = el}
                                    value={data}
                                    onChange={(e) => {
                                        if (e.target.value.length <= 1) {
                                            handleChange(e.target, index)
                                        }
                                        if (error) setError('');
                                    }}
                                    onKeyDown={(e) => handleKeyDown(e, index)}
                                    onFocus={(e) => e.target.select()}
                                    maxLength={1}
                                    className={`w-10 h-10 sm:w-[64px] sm:h-[56px] text-center text-[20px] border rounded-[8px] transition-colors bg-white font-medium text-gray-900 outline-none
                                        ${error ? 'border-red-500 hover:border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500/20' : 'border-gray-300 focus:border-[#0B3D2E] focus:ring-1 focus:ring-[#0B3D2E]'}
                                    `}
                                />
                            ))}
                        </div>

                        <div className="mb-6 text-[14px] font-['Plus_Jakarta_Sans'] text-gray-500 text-left">
                            {timer > 0 ? (
                                <span>Didn't receive it? <span className="font-semibold text-gray-900 underline cursor-pointer">Retry</span> in 00:{timer.toString().padStart(2, '0')}</span>
                            ) : (
                                <button
                                    onClick={handleResend}
                                    className="bg-transparent border-none text-gray-900 underline cursor-pointer font-semibold p-0 text-sm focus:outline-none hover:text-[#0F3D2E]"
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

                        <button
                            onClick={handleVerify}
                            disabled={isLoading || otp.some(digit => !digit)}
                            className="w-full h-[56px] bg-[#A7C0B8] text-white text-[16px] font-['Plus_Jakarta_Sans'] font-medium rounded-[8px] transition-colors disabled:opacity-100 disabled:cursor-not-allowed hover:bg-[#86a89d] mt-2"
                            style={{
                                backgroundColor: (otp.some(digit => !digit) || isLoading) ? '#A7C0B8' : '#0F3D2E'
                            }}
                        >
                            {isLoading ? 'Verifying...' : 'Verify & Continue'}
                        </button>
                    </form>
                </div>
            </div>
        </AuthLayout>
    );
};

export default VerifyOTP;

