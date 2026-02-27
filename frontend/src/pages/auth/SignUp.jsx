import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import AuthLayout from '../../layout/auth/AuthLayout';
import { Upload, FileText, Trash2, ChevronDown, CloudUpload } from 'lucide-react';
import logo from '../../assets/images/logo2.png';

const FileUploadBox = ({ title, file, onFileChange, onRemove }) => {
    const [progress, setProgress] = React.useState(0);

    React.useEffect(() => {
        if (file) {
            setProgress(0);
            const interval = setInterval(() => {
                setProgress(prev => {
                    if (prev >= 100) {
                        clearInterval(interval);
                        return 100;
                    }
                    return prev + 20;
                });
            }, 300);
            return () => clearInterval(interval);
        } else {
            setProgress(0);
        }
    }, [file]);

    const handleRemove = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (onRemove) onRemove();
    };

    return (
        <div className="flex flex-col w-full">
            <p className="text-[14px] text-[#374151] mb-2 font-['Plus_Jakarta_Sans'] font-medium">{title}</p>
            {file ? (
                <div className="h-[120px] border border-[#D1D5DB] rounded-[8px] bg-[#FFFFFF] px-5 flex items-center justify-between w-full relative overflow-hidden">
                    <div className="flex items-center gap-4 w-full">
                        <div className="flex items-center justify-center w-8 h-10 border-[1.5px] border-red-500 rounded-[4px] relative shrink-0">
                            <span className="text-[11px] text-red-500 font-bold uppercase leading-none">PDF</span>
                        </div>
                        <div className="flex-1 min-w-0 flex flex-col justify-center">
                            <div className="flex justify-between items-center w-full mb-1">
                                <div>
                                    <p className="text-[14px] font-['Plus_Jakarta_Sans'] font-medium text-[#111827] truncate leading-tight">{file.name}</p>
                                    <p className="text-[12px] font-['Plus_Jakarta_Sans'] text-[#6B7280] mt-0.5">{Math.round((file.size || 204800) / 1024)} KB</p>
                                </div>
                                <div className="flex items-center gap-3 shrink-0">
                                    <label className="cursor-pointer flex items-center text-[#6B7280] hover:text-[#111827]">
                                        <input type="file" className="hidden" onChange={onFileChange} accept=".pdf,.jpg,.jpeg" />
                                        <CloudUpload size={20} strokeWidth={1.5} />
                                    </label>
                                    <span onClick={handleRemove} className="cursor-pointer flex items-center text-[#6B7280] hover:text-red-700">
                                        <Trash2 size={20} strokeWidth={1.5} />
                                    </span>
                                </div>
                            </div>
                            {progress < 100 ? (
                                <div className="flex items-center gap-3 mt-2 w-full">
                                    <div className="flex-1 h-1.5 bg-[#F9FAFB] rounded-full overflow-hidden">
                                        <div className="h-full bg-[#0F3D2E] transition-all duration-300" style={{ width: `${progress}%` }}></div>
                                    </div>
                                    <span className="text-[12px] font-medium text-[#6B7280] shrink-0">{progress}%</span>
                                </div>
                            ) : null}
                        </div>
                    </div>
                </div>
            ) : (
                <label className="h-[120px] border border-dashed border-[#D1D5DB] rounded-[8px] bg-[#FFFFFF] px-4 flex flex-col items-center justify-center cursor-pointer transition-colors hover:border-[#0F3D2E] w-full font-['Plus_Jakarta_Sans']">
                    <input type="file" className="hidden" onChange={onFileChange} accept=".pdf,.jpg,.jpeg" />
                    <FileText size={20} className="text-[#6B7280] mb-2" strokeWidth={1.5} />
                    <span className="text-[15px] font-[600] text-[#0F3D2E] leading-tight mb-1">Click to upload</span>
                    <span className="text-[13px] text-[#9CA3AF] leading-tight">PDF or JPG (max. 10MB)</span>
                </label>
            )}
        </div>
    );
};

const CustomInput = ({ label, type = 'text', value, onChange, placeholder, name, select, children, className = '', prefix }) => (
    <div className={`flex flex-col w-full ${className}`}>
        {label && (
            <label className="text-[14px] text-[#374151] mb-2 font-['Plus_Jakarta_Sans'] font-medium block">
                {label}
            </label>
        )}
        <div className="relative w-full">
            {select ? (
                <>
                    <select
                        name={name}
                        value={value}
                        onChange={onChange}
                        className={`w-full h-[56px] px-[16px] text-[15px] border border-[#D1D5DB] rounded-[8px] outline-none bg-[#FFFFFF] font-['Plus_Jakarta_Sans'] appearance-none transition-colors focus:border-[#0F3D2E] focus:ring-1 focus:ring-[#0F3D2E] ${!value ? 'text-[#6B7280]' : 'text-[#111827]'}`}
                    >
                        {children}
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[#6B7280]">
                        <ChevronDown size={20} />
                    </div>
                </>
            ) : prefix ? (
                <div className="relative flex items-center w-full h-[56px] border border-[#D1D5DB] rounded-[8px] bg-[#FFFFFF] transition-colors focus-within:border-[#0F3D2E] focus-within:ring-1 focus-within:ring-[#0F3D2E] overflow-hidden">
                    <div className="pl-4 pr-3 flex items-center h-full text-[#111827]">
                        {prefix}
                    </div>
                    <input
                        type={type}
                        name={name}
                        value={value}
                        onChange={onChange}
                        placeholder={placeholder}
                        className="flex-1 w-full h-full font-['Plus_Jakarta_Sans'] placeholder:text-[#9CA3AF] text-[#111827] outline-none bg-transparent px-[2px] text-[15px]"
                    />
                </div>
            ) : (
                <input
                    type={type}
                    name={name}
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    className="w-full h-[56px] px-[16px] text-[15px] border border-[#D1D5DB] rounded-[8px] outline-none bg-[#FFFFFF] font-['Plus_Jakarta_Sans'] transition-colors focus:border-[#0F3D2E] focus:ring-1 focus:ring-[#0F3D2E] placeholder:text-[#9CA3AF] text-[#111827]"
                />
            )}
        </div>
    </div>
);

const SignUp = () => {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();

    const [step, setStep] = useState(0);

    useEffect(() => {
        const stepParam = parseInt(searchParams.get('step') || '0', 10);
        if (stepParam >= 0 && stepParam <= 4) {
            setStep(stepParam);
        }
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
        accountHolderName: '',
        accountNumber: '',
        ifscCode: '',
        bankName: '',
        cancelledChequeFile: null,
        panCardFile: null,
    });

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({ ...formData, [name]: type === 'checkbox' ? checked : value });
    };

    const handleFileChange = (name, file) => {
        setFormData({ ...formData, [name]: file });
    };

    const handleFileRemove = (name) => {
        setFormData({ ...formData, [name]: null });
    };

    const handleNext = () => {
        if (step === 0) {
            navigate('/verify-otp', { state: { phone: formData.phone, mode: 'signup' } });
        } else if (step === 1) {
            setSearchParams({ step: '2' });
        } else if (step === 2) {
            setSearchParams({ step: '3' });
        } else if (step === 3) {
            setSearchParams({ step: '4' });
        } else if (step === 4) {
            navigate('/success', { state: { mode: 'signup' } });
        }
    };

    return (
        <AuthLayout maxWidth={step >= 2 ? "100%" : "480px"} hideLeftPanel={true}>
            {step < 2 ? (
                <div className="text-left w-full max-w-[480px] mx-auto flex flex-col justify-center min-h-[100dvh] md:min-h-0 py-8 md:py-0">
                    {/* Header: Logo and Step Pill */}
                    <div className="flex justify-between items-center mb-12">
                        <img
                            src={logo}
                            alt="WeighPro Logo"
                            className="h-7 block"
                            onError={(e) => { e.target.style.display = 'none' }}
                        />
                        <div className="bg-[#F3F4F6] text-[#374151] px-[12px] py-[6px] rounded-full text-[12px] font-medium">
                            Step 0{step}/05
                        </div>
                    </div>

                    {/* Step Content */}
                    {step === 0 ? (
                        <div>
                            <div className="mb-8">
                                <h2 className="text-[30px] font-['Geist_Sans'] font-bold mb-1 leading-tight text-gray-900">
                                    Create your<br />seller account
                                </h2>
                                <p className="text-[14px] font-['Plus_Jakarta_Sans'] font-medium mb-6 text-gray-500">
                                    Start receiving farmer orders and grow your shop
                                </p>
                            </div>

                            <form noValidate onSubmit={(e) => e.preventDefault()}>
                                <div className="mb-6">
                                    <CustomInput
                                        label="Phone number"
                                        placeholder="Enter your number"
                                        name="phone"
                                        type="tel"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        prefix={
                                            <div className="flex items-center gap-1.5 pr-2">
                                                <span className="text-[15px] font-medium text-[#111827]">IN</span>
                                                <ChevronDown size={16} className="text-[#6B7280]" strokeWidth={2} />
                                            </div>
                                        }
                                    />
                                </div>

                                <div className="flex items-center mb-8">
                                    <label className="flex items-start cursor-pointer group">
                                        <input
                                            type="checkbox"
                                            name="agreed"
                                            className="mt-[3px] shrink-0 mr-3 peer accent-[#0F3D2E] text-[#0F3D2E] w-[18px] h-[18px] rounded-[4px] border-[#D1D5DB] cursor-pointer"
                                            checked={formData.agreed}
                                            onChange={handleChange}
                                        />
                                        <span className="text-[14px] font-['Plus_Jakarta_Sans'] text-gray-500 mt-1 cursor-pointer">
                                            By logging in, I agree to <Link to="#" className="text-gray-500 underline font-medium hover:text-[#0F3D2E] transition-colors">T&C</Link> and <Link to="#" className="text-gray-500 underline font-medium hover:text-[#0F3D2E] transition-colors">Privacy Policy</Link>
                                        </span>
                                    </label>
                                </div>

                                <button
                                    disabled={!formData.phone || !formData.agreed}
                                    onClick={handleNext}
                                    className="w-full h-[56px] bg-[#A7C0B8] text-white text-[16px] font-['Plus_Jakarta_Sans'] font-medium rounded-[8px] transition-colors disabled:opacity-100 disabled:cursor-not-allowed hover:bg-[#86a89d]"
                                    style={{
                                        backgroundColor: (!formData.phone || !formData.agreed) ? '#A7C0B8' : '#0F3D2E'
                                    }}
                                >
                                    Get OTP
                                </button>
                            </form>
                        </div>
                    ) : (
                        <div>
                            <div className="mb-8">
                                <h2 className="text-[30px] font-['Geist_Sans'] font-bold mb-1 leading-tight text-gray-900">
                                    Set up your<br />seller profile
                                </h2>
                                <p className="text-[14px] font-['Plus_Jakarta_Sans'] font-medium mb-6 text-gray-500">
                                    Your journey to easier selling starts here
                                </p>
                            </div>

                            <form noValidate onSubmit={(e) => e.preventDefault()}>
                                <div className="mb-6">
                                    <CustomInput
                                        label="First name"
                                        placeholder="Enter your first name"
                                        name="firstName"
                                        value={formData.firstName}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div className="mb-6">
                                    <CustomInput
                                        label="Last name"
                                        placeholder="Enter your last name"
                                        name="lastName"
                                        value={formData.lastName}
                                        onChange={handleChange}
                                    />
                                </div>
                                <div className="mb-8">
                                    <CustomInput
                                        label="Email"
                                        placeholder="Enter your email ID"
                                        name="email"
                                        type="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                    />
                                </div>
                                <button
                                    disabled={!formData.firstName || !formData.lastName || !formData.email}
                                    onClick={handleNext}
                                    className="w-full h-[56px] text-white text-[16px] font-['Plus_Jakarta_Sans'] font-medium rounded-[8px] transition-colors disabled:opacity-100 disabled:cursor-not-allowed hover:bg-[#86a89d]"
                                    style={{
                                        backgroundColor: (!formData.firstName || !formData.lastName || !formData.email) ? '#A7C0B8' : '#0F3D2E'
                                    }}
                                >
                                    Save & Continue
                                </button>
                            </form>
                        </div>
                    )}
                </div>
            ) : (
                <div className="w-full min-h-[100dvh] md:min-h-0 h-full flex justify-center items-center bg-[#FFFFFF] py-8 md:py-0">
                    <div className="w-full max-w-[860px] sm:px-[40px] px-6 flex flex-col justify-center items-start">
                        {step === 2 && (
                            <>
                                <div className="flex justify-between items-center mb-8 w-full">
                                    <img src={logo} alt="WeighPro Logo" className="h-6" onError={(e) => { e.target.style.display = 'none' }} />
                                    <div className="bg-[#F3F4F6] text-[#374151] px-[12px] py-[6px] rounded-full text-[12px] font-medium">
                                        Step 0{step}/05
                                    </div>
                                </div>

                                <h2 className="text-[30px] font-['Geist_Sans'] font-bold mb-1 leading-tight text-gray-900 w-full">
                                    Tell us about your Business
                                </h2>
                                <p className="text-[14px] font-['Plus_Jakarta_Sans'] font-medium mb-[40px] text-gray-500 w-full">
                                    We just need a few quick details to confirm your business
                                </p>

                                <form noValidate onSubmit={(e) => e.preventDefault()} className="w-full">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-[24px] w-full">
                                        <CustomInput
                                            label="Udyog aadhar"
                                            placeholder="Enter your 12 digit udyam registration no."
                                            name="udyogAadhar"
                                            value={formData.udyogAadhar}
                                            onChange={handleChange}
                                        />
                                        <CustomInput
                                            label="GST number (Optional)"
                                            placeholder="Enter your 15 digit GSTIN"
                                            name="gstNumber"
                                            value={formData.gstNumber}
                                            onChange={handleChange}
                                        />
                                        <FileUploadBox
                                            title="Upload udyog aadhar certificate"
                                            file={formData.udyogAadharFile}
                                            onFileChange={(e) => handleFileChange('udyogAadharFile', e.target.files[0])}
                                            onRemove={() => handleFileRemove('udyogAadharFile')}
                                        />
                                        <FileUploadBox
                                            title="Upload GST Certificate (Optional)"
                                            file={formData.gstFile}
                                            onFileChange={(e) => handleFileChange('gstFile', e.target.files[0])}
                                            onRemove={() => handleFileRemove('gstFile')}
                                        />
                                        <div className="col-span-1 md:col-span-2 w-full flex justify-center mb-2">
                                            <div className="w-full md:w-[calc(50%-12px)]">
                                                <FileUploadBox
                                                    title="Upload other document (Optional)"
                                                    file={formData.otherDocFile}
                                                    onFileChange={(e) => handleFileChange('otherDocFile', e.target.files[0])}
                                                    onRemove={() => handleFileRemove('otherDocFile')}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="col-span-1 md:col-span-2 w-full flex justify-center mt-[12px]">
                                        <button
                                            disabled={!formData.udyogAadhar}
                                            onClick={handleNext}
                                            className="w-full md:w-[calc(50%-12px)] h-[56px] bg-[#0F3D2E] text-white text-[16px] font-['Plus_Jakarta_Sans'] font-medium rounded-[8px] hover:bg-[#0a291f] disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                                        >
                                            Save & Continue
                                        </button>
                                    </div>
                                </form>
                            </>
                        )}

                        {step === 3 && (
                            <>
                                <div className="flex justify-between items-center mb-8 w-full">
                                    <img src={logo} alt="WeighPro Logo" className="h-6" onError={(e) => { e.target.style.display = 'none' }} />
                                    <div className="bg-[#F3F4F6] text-[#374151] px-[12px] py-[6px] rounded-full text-[12px] font-medium">
                                        Step 0{step}/05
                                    </div>
                                </div>

                                <h2 className="text-[30px] font-['Geist_Sans'] font-bold mb-1 leading-tight text-gray-900 w-full">
                                    Tell us about your Shop
                                </h2>
                                <p className="text-[14px] font-['Plus_Jakarta_Sans'] font-medium mb-[40px] text-gray-500 w-full">
                                    We just need a few quick details to confirm your business
                                </p>

                                <form noValidate onSubmit={(e) => e.preventDefault()} className="w-full">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-[24px] w-full">
                                        <CustomInput
                                            label="Shop Name"
                                            placeholder="Enter your shop name"
                                            name="shopName"
                                            value={formData.shopName}
                                            onChange={handleChange}
                                        />
                                        <CustomInput
                                            label="Address"
                                            placeholder="Enter your address"
                                            name="address"
                                            value={formData.address}
                                            onChange={handleChange}
                                        />
                                        <CustomInput
                                            label="Village"
                                            placeholder="Enter your village name"
                                            name="village"
                                            value={formData.village}
                                            onChange={handleChange}
                                        />
                                        <CustomInput
                                            label="Pin Code"
                                            placeholder="Enter your pincode"
                                            name="pinCode"
                                            type="text"
                                            value={formData.pinCode}
                                            onChange={handleChange}
                                        />
                                        <CustomInput
                                            select
                                            label="District"
                                            name="district"
                                            value={formData.district}
                                            onChange={handleChange}
                                        >
                                            <option value="" disabled className="hidden">Select district</option>
                                            <option value="District 1">Kolhapur</option>
                                            <option value="District 2">Satara</option>
                                            <option value="District 3">Sangli</option>
                                            <option value="District 4">Solapur</option>
                                        </CustomInput>
                                        <CustomInput
                                            select
                                            label="State"
                                            name="state"
                                            value={formData.state}
                                            onChange={handleChange}
                                        >
                                            <option value="" disabled className="hidden">Select state</option>
                                            <option value="State 1">Maharashtra</option>
                                            <option value="State 2">Goa</option>
                                            <option value="State 3">Karnataka</option>
                                            <option value="State 4">Gujarat</option>
                                        </CustomInput>
                                    </div>

                                    <div className="col-span-1 md:col-span-2 w-full flex justify-center mt-[12px]">
                                        <button
                                            disabled={!formData.shopName || !formData.address || !formData.village || !formData.pinCode || !formData.district || !formData.state}
                                            onClick={handleNext}
                                            className="w-full md:w-[calc(50%-12px)] h-[56px] bg-[#0F3D2E] text-white text-[16px] font-['Plus_Jakarta_Sans'] font-medium rounded-[8px] hover:bg-[#0a291f] disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                                        >
                                            Save & Continue
                                        </button>
                                    </div>
                                </form>
                            </>
                        )}

                        {step === 4 && (
                            <>
                                <div className="flex justify-between items-center mb-8 w-full">
                                    <img src={logo} alt="WeighPro Logo" className="h-6" onError={(e) => { e.target.style.display = 'none' }} />
                                    <div className="bg-[#F3F4F6] text-[#374151] px-[12px] py-[6px] rounded-full text-[12px] font-medium">
                                        Step 0{step}/05
                                    </div>
                                </div>

                                <h2 className="text-[30px] font-['Geist_Sans'] font-bold mb-1 leading-tight text-gray-900 w-full">
                                    Add your bank details
                                </h2>
                                <p className="text-[14px] font-['Plus_Jakarta_Sans'] font-medium mb-[40px] text-gray-500 w-full">
                                    So we can send your payments on time, we need your correct bank account details
                                </p>

                                <form noValidate onSubmit={(e) => e.preventDefault()} className="w-full">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-[24px] w-full">
                                        <CustomInput
                                            label="Account holder name"
                                            placeholder="Enter your account holder name"
                                            name="accountHolderName"
                                            value={formData.accountHolderName}
                                            onChange={handleChange}
                                        />
                                        <CustomInput
                                            label="Account number"
                                            placeholder="Enter your account number"
                                            name="accountNumber"
                                            value={formData.accountNumber}
                                            onChange={handleChange}
                                        />
                                        <CustomInput
                                            label="IFSC code"
                                            placeholder="Enter your IFSC code"
                                            name="ifscCode"
                                            value={formData.ifscCode}
                                            onChange={handleChange}
                                        />
                                        <CustomInput
                                            select
                                            label="Bank name"
                                            name="bankName"
                                            value={formData.bankName}
                                            onChange={handleChange}
                                        >
                                            <option value="" disabled className="hidden">Select bank</option>
                                            <option value="ICICI Bank">ICICI Bank</option>
                                            <option value="Bank of India">Bank of India</option>
                                            <option value="HDFC Bank">HDFC Bank</option>
                                            <option value="State Bank of India">State Bank of India</option>
                                            <option value="Axis Bank">Axis Bank</option>
                                            <option value="Kotak Mahindra Bank">Kotak Mahindra Bank</option>
                                        </CustomInput>

                                        <FileUploadBox
                                            title="Upload Cancelled Cheque"
                                            file={formData.cancelledChequeFile}
                                            onFileChange={(e) => handleFileChange('cancelledChequeFile', e.target.files[0])}
                                            onRemove={() => handleFileRemove('cancelledChequeFile')}
                                        />
                                        <FileUploadBox
                                            title="Upload PAN Card (Optional)"
                                            file={formData.panCardFile}
                                            onFileChange={(e) => handleFileChange('panCardFile', e.target.files[0])}
                                            onRemove={() => handleFileRemove('panCardFile')}
                                        />
                                    </div>

                                    <div className="col-span-1 md:col-span-2 w-full flex justify-center mt-[12px]">
                                        <button
                                            disabled={!formData.accountHolderName || !formData.accountNumber || !formData.ifscCode || !formData.bankName || !formData.cancelledChequeFile}
                                            onClick={handleNext}
                                            className="w-full md:w-[calc(50%-12px)] h-[56px] bg-[#0F3D2E] text-white text-[16px] font-['Plus_Jakarta_Sans'] font-medium rounded-[8px] hover:bg-[#0a291f] disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                                        >
                                            {(!formData.accountHolderName || !formData.accountNumber || !formData.ifscCode || !formData.bankName || !formData.cancelledChequeFile) ? "Save & Continue" : "Save & Finish"}
                                        </button>
                                    </div>
                                </form>
                            </>
                        )}
                    </div>
                </div>
            )}
        </AuthLayout>
    );
};

export default SignUp;