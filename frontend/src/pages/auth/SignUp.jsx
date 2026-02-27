import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import AuthLayout from '../../layout/auth/AuthLayout';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import logo from '../../assets/images/logo2.png';

const FileUploadBox = ({ title, file, onFileChange }) => (
    <div className="flex-1 w-full">
        <p className="mb-2 text-[#374151] text-sm">{title}</p>
        <label className="border border-dashed border-[#D1D5DB] rounded-lg p-6 flex flex-col items-center justify-center cursor-pointer bg-white min-h-[120px] transition-colors hover:border-[#0B3D2E]">
            <input type="file" hidden onChange={onFileChange} accept=".pdf,.jpg,.jpeg" />
            <span className="text-[#6B7280] mb-2">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M14 2H6C4.89543 2 4 2.89543 4 4V20C4 21.1046 4.89543 22 6 22H18C19.1046 22 20 21.1046 20 20V8L14 2Z" stroke="#6B7280" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M14 2V8H20" stroke="#6B7280" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M9 13H15" stroke="#6B7280" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M9 17H13" stroke="#6B7280" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            </span>
            <p className="text-[#0B3D2E] font-semibold mb-1 text-sm">
                {file ? file.name : 'Click to upload'}
            </p>
            <p className="text-[#9CA3AF] text-xs">
                PDF or JPG (max. 10MB)
            </p>
        </label>
    </div>
);

const SignUp = () => {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();

    const [step, setStep] = useState(0);

    useEffect(() => {
        const stepParam = parseInt(searchParams.get('step') || '0', 10);
        setStep(stepParam);
    }, [searchParams]);

    const [formData, setFormData] = useState({
        phone: '',
        agreed: false,
        firstName: '',
        lastName: '',
        email: '',
        udyogAadhar: '',
        gstNumber: '',
        udyogAadharFile: null,
        gstFile: null,
        otherDocFile: null,
        shopName: '',
        address: '',
        village: '',
        pinCode: '',
        district: '',
        state: '',
    });

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
    };

    const handleFileChange = (name, file) => {
        setFormData({ ...formData, [name]: file });
    };

    const handleNext = () => {
        if (step === 0) {
            navigate('/verify-otp', { state: { phone: formData.phone, mode: 'signup' } });
        } else if (step === 1) {
            setSearchParams({ step: '2' });
        } else if (step === 2) {
            setSearchParams({ step: '3' });
        } else if (step === 3) {
            navigate('/success', { state: { mode: 'signup' } });
        }
    };

    return (
        <AuthLayout>
            <div className="text-left w-full max-w-[480px] mx-auto">
                {/* Header: Logo and Step Pill */}
                <div className="flex justify-between items-center mb-10">
                    <img
                        src={logo}
                        alt="WeighPro Logo"
                        className="h-7 block"
                        onError={(e) => { e.target.style.display = 'none' }}
                    />
                    <div className="bg-[#F3F4F6] text-[#4B5563] px-4 py-1 rounded-full text-sm font-medium">
                        Step 0{step}/04
                    </div>
                </div>

                {/* Step Content */}
                {step === 0 && (
                    <div>
                        <div className="mb-8">
                            <h1 className="mb-2 text-[30px] font-['Geist_Sans'] font-bold text-[#111827] leading-[1.2]">
                                Create your<br />seller account
                            </h1>
                            <p className="text-[14px] font-['Plus_Jakarta_Sans'] text-[#6B7280]">
                                Start receiving farmer orders and grow your shop
                            </p>
                        </div>

                        <form noValidate>
                            <div className="mb-6">
                                <Input
                                    label="Phone number"
                                    placeholder="Enter your number"
                                    name="phone"
                                    type="tel"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    startIcon={
                                        <div className="flex items-center gap-1.5 pr-3 mr-1.5 border-r border-[#E5E7EB] ml-0">
                                            <span className="text-[#4B5563] font-medium text-sm">IN</span>
                                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                                                <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                        </div>
                                    }
                                />
                            </div>

                            <div className="flex items-center mb-8">
                                <label className="flex items-start cursor-pointer">
                                    <input
                                        type="checkbox"
                                        name="agreed"
                                        checked={formData.agreed}
                                        onChange={handleChange}
                                        className="mt-1 mr-2 text-[#0B3D2E] rounded border-gray-300 focus:ring-[#0B3D2E]"
                                    />
                                    <span className="text-[14px] font-['Plus_Jakarta_Sans'] text-[#6B7280]">
                                        By logging in, I agree to <a href="#" className="text-[#4B5563] underline font-medium">T&C</a> and <a href="#" className="text-[#4B5563] underline font-medium">Privacy Policy</a>
                                    </span>
                                </label>
                            </div>

                            <Button
                                disabled={!formData.phone || !formData.agreed}
                                onClick={handleNext}
                                className="text-[16px] font-['Plus_Jakarta_Sans'] py-3 rounded-lg"
                            >
                                Get OTP
                            </Button>
                        </form>
                    </div>
                )}

                {step === 1 && (
                    <div>
                        <div className="mb-8">
                            <h1 className="mb-2 text-[30px] font-['Geist_Sans'] font-bold text-[#111827] leading-[1.2]">
                                Set up your<br />seller profile
                            </h1>
                            <p className="text-[14px] font-['Plus_Jakarta_Sans'] text-[#6B7280]">
                                Your journey to easier selling starts here
                            </p>
                        </div>

                        <form noValidate>
                            <div className="mb-6">
                                <Input
                                    label="First name"
                                    placeholder="Enter your first name"
                                    name="firstName"
                                    value={formData.firstName}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="mb-6">
                                <Input
                                    label="Last name"
                                    placeholder="Enter your last name"
                                    name="lastName"
                                    value={formData.lastName}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="mb-8">
                                <Input
                                    label="Email"
                                    placeholder="Enter your email ID"
                                    name="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                />
                            </div>
                            <Button
                                disabled={!formData.firstName || !formData.lastName || !formData.email}
                                onClick={handleNext}
                                className="text-[16px] font-['Plus_Jakarta_Sans'] py-3 rounded-lg"
                            >
                                Save & Continue
                            </Button>
                        </form>
                    </div>
                )}

                {step === 2 && (
                    <div>
                        <div className="mb-8">
                            <h1 className="mb-2 text-[30px] font-['Geist_Sans'] font-bold text-[#111827] leading-[1.2]">
                                Tell us about your Business
                            </h1>
                            <p className="text-[14px] font-['Plus_Jakarta_Sans'] text-[#6B7280]">
                                We just need a few quick details to confirm your business
                            </p>
                        </div>

                        <form noValidate>
                            <div className="flex flex-col sm:flex-row gap-4 mb-6">
                                <Input
                                    label="Udyog aadhar"
                                    placeholder="Enter your 12 digit udyam registration no."
                                    name="udyogAadhar"
                                    value={formData.udyogAadhar}
                                    onChange={handleChange}
                                />
                                <Input
                                    label="GST number (Optional)"
                                    placeholder="Enter your 15 digit GSTIN"
                                    name="gstNumber"
                                    value={formData.gstNumber}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="flex flex-col sm:flex-row gap-4 mb-6">
                                <FileUploadBox
                                    title="Upload udyog aadhar certificate"
                                    file={formData.udyogAadharFile}
                                    onFileChange={(e) => handleFileChange('udyogAadharFile', e.target.files[0])}
                                />
                                <FileUploadBox
                                    title="Upload GST Certificate (Optional)"
                                    file={formData.gstFile}
                                    onFileChange={(e) => handleFileChange('gstFile', e.target.files[0])}
                                />
                            </div>

                            <div className="flex justify-center mb-8">
                                <div className="w-full sm:w-[60%]">
                                    <FileUploadBox
                                        title="Upload other document (Optional)"
                                        file={formData.otherDocFile}
                                        onFileChange={(e) => handleFileChange('otherDocFile', e.target.files[0])}
                                    />
                                </div>
                            </div>

                            <Button
                                disabled={!formData.udyogAadhar}
                                onClick={handleNext}
                                className="text-[16px] font-['Plus_Jakarta_Sans'] py-3 rounded-lg"
                            >
                                Save & Continue
                            </Button>
                        </form>
                    </div>
                )}

                {step === 3 && (
                    <div>
                        <div className="mb-8">
                            <h1 className="mb-2 text-[30px] font-['Geist_Sans'] font-bold text-[#111827] leading-[1.2]">
                                Tell us about your Shop
                            </h1>
                            <p className="text-[14px] font-['Plus_Jakarta_Sans'] text-[#6B7280]">
                                We just need a few quick details to confirm your business
                            </p>
                        </div>

                        <form noValidate>
                            <div className="flex flex-col sm:flex-row gap-4 mb-6">
                                <Input
                                    label="Shop Name"
                                    placeholder="Enter your shop name"
                                    name="shopName"
                                    value={formData.shopName}
                                    onChange={handleChange}
                                />
                                <Input
                                    label="Address"
                                    placeholder="Enter your address"
                                    name="address"
                                    value={formData.address}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="flex flex-col sm:flex-row gap-4 mb-6">
                                <Input
                                    label="Village"
                                    placeholder="Enter your village name"
                                    name="village"
                                    value={formData.village}
                                    onChange={handleChange}
                                />
                                <Input
                                    label="Pin Code"
                                    placeholder="Enter your pincode"
                                    name="pinCode"
                                    type="text"
                                    value={formData.pinCode}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="flex flex-col sm:flex-row gap-4 mb-8">
                                <Input
                                    select
                                    label="District"
                                    name="district"
                                    value={formData.district}
                                    onChange={handleChange}
                                >
                                    <option value="" disabled>Select district</option>
                                    <option value="District 1">Kolhapur</option>
                                    <option value="District 2">Satara</option>
                                    <option value="District 3">Sangli</option>
                                    <option value="District 4">Solapur</option>
                                </Input>
                                <Input
                                    select
                                    label="State"
                                    name="state"
                                    value={formData.state}
                                    onChange={handleChange}
                                >
                                    <option value="" disabled>Select state</option>
                                    <option value="State 1">Maharastra</option>
                                    <option value="State 2">Goa</option>
                                    <option value="State 3">Karnataka</option>
                                    <option value="State 4">Gujarat</option>
                                </Input>
                            </div>

                            <div className="flex justify-center">
                                <div className="w-full sm:w-[50%]">
                                    <Button
                                        disabled={!formData.shopName || !formData.address || !formData.village || !formData.pinCode || !formData.district || !formData.state}
                                        onClick={handleNext}
                                        className="text-[16px] font-['Plus_Jakarta_Sans'] py-3 rounded-lg"
                                    >
                                        Save & Continue
                                    </Button>
                                </div>
                            </div>
                        </form>
                    </div>
                )}
            </div>
        </AuthLayout>
    );
};

export default SignUp;
