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
            }, 4000);
            return () => clearTimeout(timer);
        }
    }, [location]);

    return (
        <AuthLayout hideLeftPanel={true}>
            {/* Success Popup */}
            {showPopup && (
                <div className="fixed top-6 left-1/2 -translate-x-1/2 bg-white rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-gray-100 p-4 min-w-[320px] max-w-[90vw] z-50 animate-in slide-in-from-top-4 fade-in duration-300">
                    <div className="flex items-center gap-3">
                        <CheckCircle2 className="w-6 h-6 text-[#16A34A] shrink-0 fill-green-50" />
                        <div className="flex-1">
                            <h3 className="text-gray-900 font-['Geist_Sans'] font-semibold text-[15px]">Success</h3>
                            <p className="text-gray-500 font-['Plus_Jakarta_Sans'] text-[13px] mt-0.5">User Registered Successfully</p>
                        </div>
                        <button
                            onClick={() => setShowPopup(false)}
                            className="p-1 hover:bg-gray-100 rounded-full transition-colors self-start border-none bg-transparent cursor-pointer"
                        >
                            <X className="w-4 h-4 text-gray-400" />
                        </button>
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
