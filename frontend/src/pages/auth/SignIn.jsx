import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthLayout from '../../layout/auth/AuthLayout';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import logo from '../../assets/images/logo2.png';
import { ChevronDown } from 'lucide-react';

const SignIn = () => {
    const [phone, setPhone] = useState('');
    const [agreed, setAgreed] = useState(false);
    const navigate = useNavigate();

    const handleGetOTP = () => {
        navigate('/verify-otp', { state: { phone } });
    };

    return (
        <AuthLayout hideLeftPanel={true}>
            <div className="text-left w-full box-border">
                <img
                    src={logo}
                    alt="WeighPro Logo"
                    className="h-10 mb-6 md:mb-4 block"
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
                    <Input
                        label="Phone number"
                        placeholder="Enter your number"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        type="tel"
                        prefix={
                            <div className="flex items-center gap-1.5 cursor-pointer hover:bg-gray-50 rounded-l-[8px] h-full">
                                <span className="text-[15px] font-medium text-gray-900">IN</span>
                                <ChevronDown size={14} className="text-gray-500" strokeWidth={2} />
                            </div>
                        }
                    />

                    <div className="flex items-start">
                        <label className="flex items-start cursor-pointer">
                            <input
                                type="checkbox"
                                checked={agreed}
                                onChange={(e) => setAgreed(e.target.checked)}
                                className="mt-1 mr-2 px-0 text-[#0B3D2E] rounded border-gray-300 focus:ring-[#0B3D2E]"
                            />
                            <span className="text-[14px] font-['Plus_Jakarta_Sans'] text-gray-500">
                                By logging in, I agree to <a href="#" className="text-gray-500 underline font-medium">T&C</a> and <a href="#" className="text-gray-500 underline font-medium">Privacy Policy</a>
                            </span>
                        </label>
                    </div>

                    <Button
                        disabled={!phone || !agreed}
                        onClick={handleGetOTP}
                        className="text-[16px] font-['Plus_Jakarta_Sans'] py-3 mt-2"
                    >
                        Get OTP
                    </Button>
                </div>
            </div>
        </AuthLayout>
    );
};

export default SignIn;
