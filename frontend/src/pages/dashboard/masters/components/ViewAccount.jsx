import React from 'react';

const InfoTableRow = ({ label1, value1, label2, value2, noBorder }) => (
    <div className={`flex flex-col sm:flex-row border-[#E5E7EB] ${noBorder ? '' : 'border-b'}`}>
        <div className="sm:w-1/4 py-3.5 px-4 md:px-6 text-[13px] text-[#6B7280] border-r border-b sm:border-b-0 border-[#E5E7EB] bg-white">
            {label1}
        </div>
        <div className="sm:w-1/4 py-3.5 px-4 md:px-6 text-[13px] text-[#111827] border-r border-b sm:border-b-0 border-[#E5E7EB] bg-white">
            {value1 || '-'}
        </div>
        <div className="sm:w-1/4 py-3.5 px-4 md:px-6 text-[13px] text-[#6B7280] border-r border-b sm:border-b-0 border-[#E5E7EB] bg-white">
            {label2}
        </div>
        <div className="sm:w-1/4 py-3.5 px-4 md:px-6 text-[13px] text-[#111827] bg-white">
            {value2 || '-'}
        </div>
    </div>
);

const SectionHeading = ({ title }) => (
    <div className="py-4 px-4 md:px-6 border-b border-[#E5E7EB] bg-white">
        <h3 className="text-[16px] font-bold text-[#111827]">{title}</h3>
    </div>
);

const ViewAccount = ({ initialData, onBack }) => {
    const data = initialData || {};

    // For OP Balance, prioritize showing raw value + type if available, to match "1000 Cr" style
    const renderOpBalance = () => {
        if (data.opBalanceRaw && data.opBalanceType) {
            return `${data.opBalanceRaw} ${data.opBalanceType}`;
        }
        return data.opBalance || '-';
    };

    return (
        <div className="flex flex-col w-full h-full animate-in fade-in duration-300">
            {/* Form Container */}
            <div className="bg-white rounded-[12px] border border-[#E5E7EB] shadow-sm flex flex-col w-full animate-in fade-in slide-in-from-left-2 duration-300">
                {/* Header */}
                <div className="px-6 py-5 border-b border-[#E5E7EB]">
                    <h2 className="text-[18px] font-bold text-[#111827]">View Account</h2>
                </div>

                {/* Form Body */}
                <div className="p-6 md:p-8 flex flex-col">
                    
                    {/* Header Section */}
                    <div className="mb-6">
                        <h1 className="text-[28px] md:text-[32px] font-bold text-[#111827] mb-2">{data.account || '-'}</h1>
                        <div className="inline-flex items-center px-4 py-1.5 bg-[#014A36] text-white rounded-[100px] text-[14px] font-medium">
                            {data.groupName || '-'}
                        </div>
                    </div>

                    {/* Table Style Layout */}
                    <div className="border border-[#E5E7EB] rounded-[8px] overflow-hidden flex flex-col w-full">
                        {/* Account Information Section */}
                        <InfoTableRow 
                            label1="GST.No:" value1={data.gstNo} 
                            label2="PAN No:" value2={data.panNo} 
                        />
                        <InfoTableRow 
                            label1="Credit Days:" value1={data.creditDays} 
                            label2="OP Balance:" value2={renderOpBalance()} 
                        />
                        <InfoTableRow 
                            label1="Vendor Code:" value1={data.vendorCode} 
                            label2="Reg.Type:" value2={data.regType} 
                        />
                        <InfoTableRow 
                            label1="Address 1:" value1={data.address1 || data.address} 
                            label2="Address 2:" value2={data.address2} 
                        />
                        <InfoTableRow 
                            label1="Area:" value1={data.area} 
                            label2="Pin Code:" value2={data.pinCode} 
                        />
                        <InfoTableRow 
                            label1="City:" value1={data.city} 
                            label2="State:" value2={data.state} 
                        />
                        <InfoTableRow 
                            label1="MSME:" value1={data.msmeId} 
                            label2="Reg.Under:" value2={data.regUnder} 
                        />

                        {/* Bank Details Section */}
                        <SectionHeading title="Bank Details" />
                        <InfoTableRow 
                            label1="Account Holder:" value1={data.accountHolder} 
                            label2="Bank Name:" value2={data.bankName} 
                        />
                        <InfoTableRow 
                            label1="Account Number:" value1={data.bankAccountNo} 
                            label2="IFSC Code:" value2={data.ifscCode} 
                        />

                        {/* Contact Person Details Section */}
                        <SectionHeading title="Contact Person Details" />
                        <InfoTableRow 
                            label1="Prefix:" value1={data.prefix} 
                            label2="Contact Person Name:" value2={data.contactPersonName} 
                        />
                        <InfoTableRow 
                            label1="Email ID:" value1={data.emailId} 
                            label2="Mobile.No:" value2={data.mobileNo} 
                            noBorder={true}
                        />
                    </div>

                    {/* Back Button */}
                    <div className="flex justify-end mt-8">
                        <button
                            onClick={onBack}
                            className="px-8 h-[44px] border border-[#E5E7EB] text-[#4B5563] rounded-[8px] text-[14px] font-semibold hover:bg-gray-50 transition-colors bg-white shadow-sm flex items-center justify-center"
                        >
                            Back
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default ViewAccount;
