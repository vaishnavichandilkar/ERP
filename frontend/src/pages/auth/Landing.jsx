import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import AuthLayout from '../../layout/auth/AuthLayout';
import Button from '../../components/common/Button';
import { CheckCircle2, X } from 'lucide-react';
import logo from '../../assets/images/logo2.png';

const Landing = () => {
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

    return (
        <AuthLayout hideLeftPanel={true}>
            {/* Success Popup */}
            {/* Success Modal */}
            {showPopup && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl shadow-2xl w-[420px] max-w-[90vw] p-8 text-center relative animate-in fade-in zoom-in duration-300">

                        {/* Close Button */}
                        <button
                            onClick={() => setShowPopup(false)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        {/* Success Icon */}
                        <div className="flex justify-center mb-4">
                            <CheckCircle2 className="w-16 h-16 text-green-500" />
                        </div>

                        {/* Title */}
                        <h2 className="text-2xl font-bold text-gray-900 mb-2 font-['Geist_Sans']">
                            Congratulations!
                        </h2>

                        {/* Message */}
                        <p className="text-gray-600 text-[15px] font-['Plus_Jakarta_Sans'] mb-6">
                            Your account has been successfully registered.
                            You can now login and start using WeighPro.
                        </p>

                        {/* Login Button */}
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

            <div className="text-left w-full box-border">
                <div className="mb-6 md:mb-4">
                    <img
                        src={logo}
                        alt="WeighPro Logo"
                        className="h-10 mb-3 block"
                        onError={(e) => { e.target.style.display = 'none' }}
                    />

                    <h2 className="text-[30px] font-['Geist_Sans'] font-bold leading-tight mb-1 text-gray-900">
                        Welcome to WeighPro
                    </h2>
                    <p className="text-[14px] font-['Plus_Jakarta_Sans'] font-medium text-gray-500 mb-6">
                        Login or create an account to continue
                    </p>
                </div>

                <div className="flex flex-col gap-3 md:gap-4">
                    <p className="text-[14px] font-['Plus_Jakarta_Sans'] font-semibold text-gray-900 mb-2 text-center block">
                        Are you a GramUnati User?
                    </p>

                    <div className="flex flex-col gap-2 w-full">
                        <p className="text-[14px] font-['Plus_Jakarta_Sans'] font-medium text-gray-500 m-0">
                            Yes, I am a GramUnati user
                        </p>
                        <Button
                            variant="primary"
                            onClick={() => navigate('/login')}
                            className="text-[16px] font-['Plus_Jakarta_Sans'] py-3"
                        >
                            Go to Login Page
                        </Button>
                    </div>

                    <div className="flex items-center my-3 md:my-4">
                        <div className="flex-1 border-t border-gray-200"></div>
                        <span className="px-4 text-[14px] font-['Plus_Jakarta_Sans'] font-medium text-gray-400">OR</span>
                        <div className="flex-1 border-t border-gray-200"></div>
                    </div>

                    <div className="flex flex-col gap-2 w-full">
                        <p className="text-[14px] font-['Plus_Jakarta_Sans'] font-medium text-gray-500 m-0">
                            No, I am a new user
                        </p>
                        <Button
                            variant="primary"
                            onClick={() => navigate('/signup')}
                            className="text-[16px] font-['Plus_Jakarta_Sans'] py-3"
                        >
                            Go to SignUp Page
                        </Button>
                    </div>
                </div>
            </div>
        </AuthLayout>
    );
};

export default Landing;
