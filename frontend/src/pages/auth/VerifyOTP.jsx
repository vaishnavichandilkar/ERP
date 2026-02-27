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

    const handleVerify = () => {
        if (mode === 'signup') {
            navigate('/signup?step=1');
        } else {
            navigate('/success', { state: { mode } });
        }
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

                    <div className="flex gap-2 justify-between mb-6">
                        {otp.map((data, index) => (
                            <input
                                key={index}
                                ref={(el) => inputRefs.current[index] = el}
                                value={data}
                                onChange={(e) => {
                                    if (e.target.value.length <= 1) {
                                        handleChange(e.target, index)
                                    }
                                }}
                                onKeyDown={(e) => handleKeyDown(e, index)}
                                onFocus={(e) => e.target.select()}
                                maxLength={1}
                                className="w-10 sm:w-12 h-14 text-center text-2xl border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#0B3D2E] focus:border-[#0B3D2E] transition-colors bg-white font-medium"
                            />
                        ))}
                    </div>

                    <div className="mb-6 text-[14px] font-['Plus_Jakarta_Sans'] text-gray-500">
                        {timer > 0 ? (
                            <span>Didn't receive it? <span className="font-bold">Retry</span> in 00:{timer.toString().padStart(2, '0')}</span>
                        ) : (
                            <button
                                onClick={() => setTimer(60)}
                                className="bg-transparent border-none text-[#0B3D2E] cursor-pointer font-bold p-0 text-sm no-underline hover:underline focus:outline-none"
                            >
                                Resend OTP
                            </button>
                        )}
                    </div>

                    <Button onClick={handleVerify} className="text-[16px] font-['Plus_Jakarta_Sans'] py-3 mt-2">
                        Verify
                    </Button>
                </div>
            </div>
        </AuthLayout>
    );
};

export default VerifyOTP;

