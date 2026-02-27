import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthLayout from '../../layout/auth/AuthLayout';
import Button from '../../components/common/Button';
import { CheckCircle, XCircle, ChevronDown } from 'lucide-react';
import logo from '../../assets/images/logo2.png';

const machineOptions = ['Machine 1', 'Machine 2', 'Others'];
const modelOptions = ['HGDHJ764754675', 'JHFHFG76576556', 'Others'];
const typeOptions = ['Mechanical', 'Digital', 'Automatic'];
const makeOptions = ['Essae Weighing Machines', 'Sansui Weighing Machines', 'Others'];

const CustomAutocomplete = ({ label, placeholder, value, setValue, options }) => {
    const [isOpen, setIsOpen] = useState(false);
    const wrapperRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const filteredOptions = options.filter(opt => opt.toLowerCase().includes(value.toLowerCase()));

    return (
        <div className="mb-5 relative" ref={wrapperRef}>
            <label className="block text-[0.875rem] font-medium text-[#4B5563] mb-1.5 font-['Plus_Jakarta_Sans']">{label}</label>
            <div className="relative">
                <input
                    type="text"
                    value={value}
                    onChange={(e) => {
                        setValue(e.target.value);
                        setIsOpen(true);
                    }}
                    onClick={() => setIsOpen(true)}
                    placeholder={placeholder}
                    className="w-full min-h-[46px] px-4 py-2.5 border border-[#E5E7EB] rounded-[12px] text-[15px] font-['Plus_Jakarta_Sans'] text-[#111827] bg-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#0B3D2E] focus:border-[#0B3D2E] transition-all duration-300 pr-10 hover:border-[#D1D5DB] cursor-pointer"
                />
                <div
                    className="absolute inset-y-0 right-0 flex items-center pr-4 cursor-pointer text-gray-400"
                    onClick={() => setIsOpen(!isOpen)}
                >
                    <ChevronDown size={20} className={`transition-transform duration-300 ease-in-out ${isOpen ? 'rotate-180' : 'rotate-0'}`} />
                </div>
            </div>

            <div
                className={`absolute left-0 right-0 mt-3 z-50 transition-all duration-300 ease-out origin-top ${isOpen ? 'opacity-100 translate-y-0 scale-100 visible' : 'opacity-0 -translate-y-2 scale-95 invisible'}`}
                style={{ pointerEvents: isOpen ? 'auto' : 'none' }}
            >
                <div className="absolute -top-[7px] left-[32px] w-[14px] h-[14px] bg-white transform rotate-45 border-l border-t border-[#E5E7EB] z-20 rounded-tl-[2px]" style={{ boxShadow: '-2px -2px 3px rgba(0,0,0,0.02)' }}></div>
                <div className="relative bg-white border border-[#E5E7EB] rounded-[12px] shadow-[0_12px_36px_rgba(0,0,0,0.08)] max-h-60 overflow-auto py-2 z-10 font-['Plus_Jakarta_Sans']">
                    {filteredOptions.length > 0 ? (
                        filteredOptions.map((opt, idx) => (
                            <div
                                key={idx}
                                className="px-5 py-3 hover:bg-[#F4F7F6] cursor-pointer text-[15px] text-[#374151] transition-colors"
                                onClick={() => {
                                    setValue(opt);
                                    setIsOpen(false);
                                }}
                            >
                                {opt}
                            </div>
                        ))
                    ) : (
                        <div className="px-5 py-3 text-[14px] text-gray-500">No options found</div>
                    )}
                </div>
            </div>
        </div>
    );
};

const SelectMachine = () => {
    const navigate = useNavigate();
    const [isUsingMachine, setIsUsingMachine] = useState(null);

    const [machineName, setMachineName] = useState('');
    const [modelNumber, setModelNumber] = useState('');
    const [machineType, setMachineType] = useState('');
    const [machineMake, setMachineMake] = useState('');

    const handleDashboard = () => {
        navigate('/dashboard');
    };

    const getBtnClass = (selected) => {
        return `flex-none min-w-[90px] py-1.5 px-4 rounded-lg text-white font-medium text-sm transition-colors focus:outline-none flex items-center justify-center ${selected ? 'bg-[#0B3D2E] hover:bg-[#092E22]' : 'bg-[#9DB3A8] hover:bg-[#8CA397]'}`;
    };

    const isValid = isUsingMachine === false
        ? !!machineName
        : (!!machineName && !!modelNumber && !!machineType && !!machineMake);

    return (
        <AuthLayout>
            <div className="text-left w-full max-w-[420px] mx-auto">
                {/* Header: Logo and Step Pill */}
                <div className="flex justify-between items-center mb-6">
                    <img
                        src={logo}
                        alt="WeighPro Logo"
                        className="h-6 block"
                        onError={(e) => { e.target.style.display = 'none' }}
                    />
                    <div className="bg-[#F3F4F6] text-[#4B5563] px-4 py-1 rounded-full text-xs font-medium">
                        Step 05/05
                    </div>
                </div>

                <div className="mb-6">
                    <h1 className="mb-2 text-[30px] font-['Geist_Sans'] font-bold text-[#111827] leading-[1.2]">
                        Select Your Weighing<br />Machine & Model
                    </h1>
                    <p className="text-[#6B7280] text-[14px] font-['Plus_Jakarta_Sans'] leading-[1.4]">
                        Set up your device to ensure accurate, secure, and reliable weighing operations from day one.
                    </p>
                </div>

                <p className="text-[#4B5563] font-medium font-['Plus_Jakarta_Sans'] mb-2 text-[14px]">
                    Are you using your Weighing Machine?
                </p>

                <div className="flex gap-3 mb-4">
                    <button
                        onClick={() => setIsUsingMachine(true)}
                        className={getBtnClass(isUsingMachine === true)}
                    >
                        <CheckCircle size={16} className="mr-2" /> Yes
                    </button>
                    <button
                        onClick={() => setIsUsingMachine(false)}
                        className={getBtnClass(isUsingMachine === false)}
                    >
                        <XCircle size={16} className="mr-2" /> No
                    </button>
                </div>

                <form noValidate className="mb-2">
                    {isUsingMachine === null && (
                        <>
                            <CustomAutocomplete label="Weight Machine" placeholder="Select Weight Machine" value={machineName} setValue={setMachineName} options={machineOptions} />
                            <CustomAutocomplete label="Model Number" placeholder="Select Model" value={modelNumber} setValue={setModelNumber} options={modelOptions} />
                            <CustomAutocomplete label="Machine Type" placeholder="Select Type" value={machineType} setValue={setMachineType} options={typeOptions} />
                            <CustomAutocomplete label="Machine Make" placeholder="Select Machine Make" value={machineMake} setValue={setMachineMake} options={makeOptions} />
                        </>
                    )}
                    {isUsingMachine === true && (
                        <>
                            <CustomAutocomplete label="Machine Name" placeholder="Select/Enter Machine Name" value={machineName} setValue={setMachineName} options={machineOptions} />
                            <CustomAutocomplete label="Machine Model Number" placeholder="Select/Enter Model Number" value={modelNumber} setValue={setModelNumber} options={modelOptions} />
                            <CustomAutocomplete label="Weight Machine Type" placeholder="Select/Enter Machine Type" value={machineType} setValue={setMachineType} options={typeOptions} />
                            <CustomAutocomplete label="Machine Make" placeholder="Select/Enter Machine Make" value={machineMake} setValue={setMachineMake} options={makeOptions} />
                        </>
                    )}
                    {isUsingMachine === false && (
                        <>
                            <CustomAutocomplete label="Weighing Machine" placeholder="Select Weighing Machine" value={machineName} setValue={setMachineName} options={machineOptions} />
                        </>
                    )}

                    <Button
                        onClick={handleDashboard}
                        disabled={!isValid}
                        className="w-full py-3 mt-2 text-[16px] font-['Plus_Jakarta_Sans'] rounded-lg"
                    >
                        Save & Finish
                    </Button>
                </form>
            </div>
        </AuthLayout>
    );
};

export default SelectMachine;
