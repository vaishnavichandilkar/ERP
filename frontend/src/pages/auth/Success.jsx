import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import AuthLayout from '../../layout/auth/AuthLayout';
import Button from '../../components/common/Button';
import logo from '../../assets/images/Verified_logo.png';

const Success = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const mode = location.state?.mode || 'login';

    const handleNavigation = () => {
        if (mode === 'signup') {
            navigate('/select-machine');
        } else {
            navigate('/select-machine');
        }
    };

    return (
        <AuthLayout hideLeftPanel={true}>
            <div className="text-center pt-8 md:pt-0 w-full max-w-sm mx-auto">
                <img
                    src={logo}
                    alt="Verified Logo"
                    className="h-[90px] mx-auto mb-10 md:mb-4 block"
                    onError={(e) => { e.target.style.display = 'none' }}
                />

                <h2 className="text-[30px] font-['Geist_Sans'] font-bold mb-2 leading-tight text-gray-900">
                    Successfully Verified
                </h2>

                <p className="text-[14px] font-['Plus_Jakarta_Sans'] font-medium mb-8 text-gray-500">
                    {mode === 'signup'
                        ? "Your account has been successfully verified. You'll be redirected shortly to the Registration Form"
                        : "Your account has been successfully verified."}
                </p>

                <Button onClick={handleNavigation} className="text-[16px] font-['Plus_Jakarta_Sans'] py-3 px-6 mt-4">
                    {mode === 'signup' ? "Select Weighing Machine" : "Select Weighing Machine"}
                </Button>
            </div>
        </AuthLayout>
    );
};

export default Success;
