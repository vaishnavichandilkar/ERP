import React from 'react';
import { useNavigate } from 'react-router-dom';
import AuthLayout from '../../layout/auth/AuthLayout';
import Button from '../../components/common/Button';
import logo from '../../assets/images/logo2.png';

const Landing = () => {
    const navigate = useNavigate();

    return (
        <AuthLayout hideLeftPanel={true}>
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
