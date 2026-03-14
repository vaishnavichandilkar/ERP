import React from 'react';
import { useTranslation } from 'react-i18next';

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
    const { t } = useTranslation(['modules', 'common']);
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
                    <h2 className="text-[18px] font-bold text-[#111827]">{t('view_account')}</h2>
                </div>

                {/* Form Body */}
                <div className="p-6 md:p-8 flex flex-col">
                    
                    {/* Header Section */}
                    <div className="mb-6">
                        <h1 className="text-[28px] md:text-[32px] font-bold text-[#111827] mb-2">{data.accountName || '-'}</h1>
                        <div className="flex gap-2">
                            {data.isCustomer && (
                                <div className="inline-flex items-center px-4 py-1.5 bg-[#014A36] text-white rounded-[100px] text-[14px] font-medium">
                                    {t('customer')}
                                </div>
                            )}
                            {data.isVendor && (
                                <div className="inline-flex items-center px-4 py-1.5 bg-[#4B5563] text-white rounded-[100px] text-[14px] font-medium">
                                    {t('vendor')}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Table Style Layout */}
                    <div className="border border-[#E5E7EB] rounded-[8px] overflow-hidden flex flex-col w-full">
                        {/* Account Information Section */}
                        <InfoTableRow 
                            label1={`${t('gst_no')}:`} value1={data.gstNo} 
                            label2={`${t('pan_no')}:`} value2={data.panNo} 
                        />
                        <InfoTableRow 
                            label1={`${t('credit_days')}:`} value1={data.creditDays} 
                            label2={`${t('op_balance')}:`} value2={renderOpBalance()} 
                        />
                        <InfoTableRow 
                            label1={`${t('customer_code')}:`} value1={data.customerCode} 
                            label2={`${t('vendor_code')}:`} value2={data.vendorCode} 
                        />
                        <InfoTableRow 
                            label1={`${t('address_1')}:`} value1={data.addressLine1} 
                            label2={`${t('address_2')}:`} value2={data.addressLine2} 
                        />
                        <InfoTableRow 
                            label1={`${t('area')}:`} value1={data.area} 
                            label2={`${t('pin_code')}:`} value2={data.pincode} 
                        />
                        <InfoTableRow 
                            label1={`${t('city')}:`} value1={data.city} 
                            label2={`${t('state')}:`} value2={data.state} 
                        />
                        <InfoTableRow 
                            label1={`${t('reg_type')}:`} value1={data.regType} 
                            label2={`${t('msme')}:`} value2={data.msmeRegNo} 
                        />
                        <InfoTableRow 
                            label1={`${t('reg_under')}:`} value1={data.regUnder} 
                            label2={''} value2={''} 
                        />

                        {/* Bank Details Section */}
                        <SectionHeading title={t('bank_details')} />
                        <InfoTableRow 
                            label1={`${t('account_holder')}:`} value1={data.accountHolderName} 
                            label2={`${t('bank_name')}:`} value2={data.bankName} 
                        />
                        <InfoTableRow 
                            label1={`${t('account_number')}:`} value1={data.accountNumber} 
                            label2={`${t('ifsc_code')}:`} value2={data.ifscCode} 
                        />

                        {/* Contact Person Details Section */}
                        <SectionHeading title={t('contact_person_details')} />
                        <InfoTableRow 
                            label1={`${t('prefix')}:`} value1={data.prefix} 
                            label2={`${t('contact_person_name')}:`} value2={data.contactPersonName} 
                        />
                        <InfoTableRow 
                            label1={`${t('email_id')}:`} value1={data.emailId} 
                            label2={`${t('mobile_no')}:`} value2={data.mobileNo} 
                            noBorder={true}
                        />
                    </div>

                    {/* Back Button */}
                    <div className="flex justify-end mt-8">
                        <button
                            onClick={onBack}
                            className="px-8 h-[44px] border border-[#E5E7EB] text-[#4B5563] rounded-[8px] text-[14px] font-semibold hover:bg-gray-50 transition-colors bg-white shadow-sm flex items-center justify-center"
                        >
                            {t('common:back')}
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default ViewAccount;
