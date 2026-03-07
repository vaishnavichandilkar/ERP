import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axiosInstance from '../../services/axiosInstance';
import AuthLayout from '../../layout/auth/AuthLayout';
import Button from '../../components/common/Button';
import { Clock, AlertCircle, X, Check } from 'lucide-react';

// For the scalloped badge icon on Approved state
const SealCheckIcon = ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
        <path d="M11.602 1.697a1.006 1.006 0 0 1 .796 0l2.585 1.109a1.006 1.006 0 0 0 .584.078l2.768-.538a1.006 1.006 0 0 1 1.096.536l1.325 2.505a1.006 1.006 0 0 0 .45.45l2.505 1.325a1.006 1.006 0 0 1 .536 1.096l-.538 2.768a1.006 1.006 0 0 0 .078.584l1.109 2.585a1.006 1.006 0 0 1 0 .796l-1.109 2.585a1.006 1.006 0 0 0-.078.584l.538 2.768a1.006 1.006 0 0 1-.536 1.096l-2.505 1.325a1.006 1.006 0 0 0-.45.45l-1.325 2.505a1.006 1.006 0 0 1-1.096.536l-2.768-.538a1.006 1.006 0 0 0-.584.078l-2.585 1.109a1.006 1.006 0 0 1-.796 0l-2.585-1.109a1.006 1.006 0 0 0-.584-.078l-2.768.538a1.006 1.006 0 0 1-1.096-.536l-1.325-2.505a1.006 1.006 0 0 0-.45-.45l-2.505-1.325a1.006 1.006 0 0 1-.536-1.096l.538-2.768a1.006 1.006 0 0 0-.078-.584l-1.109-2.585a1.006 1.006 0 0 1 0-.796l1.109-2.585a1.006 1.006 0 0 0 .078-.584l-.538-2.768a1.006 1.006 0 0 1 .536-1.096l2.505-1.325a1.006 1.006 0 0 0 .45-.45l1.325-2.505a1.006 1.006 0 0 1 1.096-.536l2.768.538a1.006 1.006 0 0 0 .584-.078l2.585-1.109zM10.74 15.228l-3.32-3.32-1.414 1.414 4.734 4.734 8.26-8.26-1.414-1.414-6.846 6.846z" />
    </svg>
);

const ApplicationStatus = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // Initial values from location state (VerifyOTP)
    const initialState = location.state?.status;
    const initialReason = location.state?.rejectionReason;
    const initialIsFirst = location.state?.isFirstApprovalLogin;

    const [apiStatus, setApiStatus] = useState(initialState || 'PENDING');
    const [rejectionReason, setRejectionReason] = useState(initialReason || null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchStatus = async () => {
            try {
                // DB-Managed session: Fetch fresh status on every mount
                const response = await axiosInstance.get(`/auth/me?t=${Date.now()}`);

                if (response.data) {
                    const { approvalStatus, isFirstApprovalLogin, rejectionReason: dbReason } = response.data;

                    // Sync local storage for consistency, but render based on response data
                    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
                    localStorage.setItem('user', JSON.stringify({
                        ...currentUser,
                        approvalStatus,
                        isFirstApprovalLogin
                    }));

                    // If approved and already marked as seen in DB
                    if (approvalStatus === 'APPROVED' && !isFirstApprovalLogin) {
                        navigate('/dashboard', { replace: true });
                        return;
                    }

                    setApiStatus(approvalStatus);
                    setRejectionReason(dbReason);
                }
            } catch (error) {
                console.error("Failed to fetch fresh application status from DB", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchStatus();
    }, [navigate]);

    const handleStartUsing = async () => {
        try {
            setIsLoading(true);
            // Strictly managed: Update DB first
            await axiosInstance.post('/auth/mark-approval-seen');

            // Navigate only after DB success
            navigate('/dashboard', { replace: true });
        } catch (error) {
            console.error('Failed to update approval status in DB', error);
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <AuthLayout hideLeftPanel={false}>
                <div className="flex items-center justify-center w-full h-full">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0B3D2E]"></div>
                </div>
            </AuthLayout>
        );
    }

    const renderPendingState = () => (
        <div className="flex flex-col items-center justify-center text-center w-full max-w-[420px] mx-auto animate-in fade-in zoom-in duration-500 md:mt-0 pt-8 pb-10">
            <div className="w-[110px] h-[110px] bg-[#0B3D2E] rounded-full flex items-center justify-center mb-6 shadow-sm">
                <Clock className="w-12 h-12 text-white" strokeWidth={2} />
            </div>

            <h1 className="text-[24px] md:text-[28px] font-bold font-['Plus_Jakarta_Sans'] text-[#111827] mb-2 tracking-tight">
                Application Submitted!
            </h1>
            <p className="text-[13px] md:text-[15px] text-[#4B5563] font-['Plus_Jakarta_Sans'] leading-relaxed mb-6 px-4 font-medium">
                Thank you for registering! Your application<br className="hidden md:block" /> is under review
            </p>

            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#FFF7ED] mb-8">
                <div className="w-1.5 h-1.5 rounded-full bg-[#C2410C]"></div>
                <span className="text-[12px] font-semibold text-[#C2410C] font-['Plus_Jakarta_Sans']">Approval Pending</span>
            </div>

            <div className="w-[180px] md:max-w-[280px] mx-auto text-left mb-8 relative">
                {/* Vertical Line */}
                <div className="absolute left-[3.5px] top-2 bottom-3 w-[1px] bg-[#0B3D2E] z-0"></div>

                <div className="relative z-10 flex items-center gap-4 mb-5">
                    <div className="w-2 h-2 rounded-full bg-[#0B3D2E] ring-[3px] ring-white"></div>
                    <span className="text-[12px] font-semibold text-[#0B3D2E] font-['Plus_Jakarta_Sans']">Registration Submitted</span>
                </div>

                <div className="relative z-10 flex items-center gap-4 mb-5">
                    <div className="w-2 h-2 rounded-full bg-[#0B3D2E] ring-[3px] ring-white"></div>
                    <span className="text-[12px] text-[#4B5563] font-['Plus_Jakarta_Sans'] font-medium">Under Review</span>
                </div>

                <div className="relative z-10 flex items-center gap-4">
                    <div className="w-2 h-2 rounded-full bg-[#0B3D2E] ring-[3px] ring-white"></div>
                    <span className="text-[12px] text-[#6B7280] font-['Plus_Jakarta_Sans'] font-medium">Approved / Rejected</span>
                </div>
            </div>

            <div className="w-full bg-[#F3F4F6] rounded-[16px] py-4 px-6 text-[12px] font-semibold text-[#111827] font-['Plus_Jakarta_Sans']">
                We'll notify you once your profile is verified
            </div>
        </div>
    );

    const renderFeedbackList = () => (
        <div className="bg-[#F9FAFB] rounded-[16px] p-5 w-full text-left mb-6">
            <h4 className="text-[13px] text-center text-[#4B5563] font-['Plus_Jakarta_Sans'] font-medium mb-6 leading-relaxed">
                Our team has reviewed your details and<br />provided detailed feedback as below
            </h4>
            <div className="space-y-4">
                {rejectionReason ? (
                    <div className="flex gap-4 items-start">
                        <p className="text-[13px] text-[#111827] font-semibold leading-[1.4] font-['Plus_Jakarta_Sans']">{rejectionReason}</p>
                    </div>
                ) : (
                    [1, 2, 3, 4, 5, 6].map((num) => (
                        <div key={num} className="flex gap-4 items-start">
                            <span className="text-[13px] font-medium text-[#6B7280] font-['Plus_Jakarta_Sans'] shrink-0 w-10">Step {num}</span>
                            <p className="text-[13px] text-[#111827] font-semibold leading-[1.4] font-['Plus_Jakarta_Sans']">Lorem ipsum text for rejection<br />added</p>
                        </div>
                    ))
                )}
            </div>
        </div>
    );

    const renderInvalidState = () => (
        <div className="flex flex-col items-center justify-center text-center w-full max-w-[420px] mx-auto animate-in fade-in zoom-in duration-500 md:mt-0 pt-8 pb-10">
            <div className="w-[110px] h-[110px] bg-[#0B3D2E] rounded-full flex items-center justify-center mb-6 shadow-sm">
                <span className="text-white text-[56px] font-['Plus_Jakarta_Sans'] leading-none h-[56px] flex items-center mb-2 font-light">!</span>
            </div>

            <h1 className="text-[24px] md:text-[28px] font-bold font-['Plus_Jakarta_Sans'] text-[#111827] mb-2 tracking-tight">
                Document Invalid!
            </h1>
            <p className="text-[13px] md:text-[14px] text-[#4B5563] font-['Plus_Jakarta_Sans'] leading-relaxed mb-6 font-medium px-2">
                Your uploaded GST document was found to<br />be invalid. Please re-upload a valid GST certificate to<br />continue with your seller registration
            </p>

            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#FFF7ED] mb-6 absolute z-10 -mt-[44px]">
                <div className="w-1.5 h-1.5 rounded-full bg-[#C2410C]"></div>
                <span className="text-[12px] font-semibold text-[#C2410C] font-['Plus_Jakarta_Sans']">Application On-Hold</span>
            </div>

            {renderFeedbackList()}

            <Button
                onClick={() => navigate('/registration-form')}
                className="w-full py-3 mt-2 text-[15px] font-semibold font-['Plus_Jakarta_Sans'] rounded-[8px] !bg-[#0B3D2E] hover:!bg-[#092E22] text-white"
            >
                Upload Again
            </Button>
        </div>
    );

    const renderRejectedState = () => (
        <div className="flex flex-col items-center justify-center text-center w-full max-w-[420px] mx-auto animate-in fade-in zoom-in duration-500 md:mt-0 pt-8 pb-10">
            <div className="w-[110px] h-[110px] bg-[#0B3D2E] rounded-full flex items-center justify-center mb-6 shadow-sm">
                <X className="w-12 h-12 text-white" strokeWidth={3} />
            </div>

            <h1 className="text-[24px] md:text-[28px] font-bold font-['Plus_Jakarta_Sans'] text-[#111827] mb-2 tracking-tight">
                Application Rejected!
            </h1>
            <p className="text-[13px] md:text-[14px] text-[#4B5563] font-['Plus_Jakarta_Sans'] leading-relaxed mb-6 font-medium px-2">
                We've reviewed your application, and unfortunately,<br />it does not meet the<br />approval criteria at this time
            </p>

            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#FEF2F2] mb-6 absolute z-10 -mt-[44px]">
                <div className="w-1.5 h-1.5 rounded-full bg-[#EF4444]"></div>
                <span className="text-[12px] font-semibold text-[#EF4444] font-['Plus_Jakarta_Sans']">Application Rejected</span>
            </div>

            {renderFeedbackList()}

            <Button
                className="w-full py-3 mt-2 text-[15px] font-semibold font-['Plus_Jakarta_Sans'] rounded-[8px] !bg-[#0B3D2E] hover:!bg-[#092E22] text-white"
            >
                Contact Us
            </Button>
        </div>
    );

    const renderApprovedState = () => (
        <div className="flex flex-col items-center justify-center text-center w-full max-w-[420px] mx-auto animate-in fade-in zoom-in duration-500 pt-16">
            <div className="w-[110px] h-[110px] text-[#0B3D2E] flex items-center justify-center mb-6">
                <SealCheckIcon className="w-full h-full" />
            </div>

            <h1 className="text-[24px] md:text-[28px] font-bold font-['Plus_Jakarta_Sans'] text-[#111827] mb-3 leading-tight tracking-tight">
                You're All Set to use<br />Weighing Scale!
            </h1>
            <p className="text-[13px] md:text-[14px] text-[#4B5563] font-['Plus_Jakarta_Sans'] leading-relaxed mb-6 font-medium px-4">
                You can now list your products, view orders, and<br />connect with farmers in your region
            </p>

            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#F0FDF4] mb-8">
                <div className="w-1 h-1 rounded-full bg-[#16A34A]"></div>
                <span className="text-[12px] font-semibold text-[#16A34A] font-['Plus_Jakarta_Sans']">Application Approved</span>
            </div>

            <Button
                onClick={handleStartUsing}
                className="w-[90%] md:w-full max-w-[340px] py-3 text-[15px] font-semibold font-['Plus_Jakarta_Sans'] rounded-[8px] !bg-[#0B3D2E] hover:!bg-[#092E22] text-white"
            >
                Start Using
            </Button>
        </div>
    );

    return (
        <AuthLayout hideLeftPanel={false}>
            <div className="w-full h-full flex items-center justify-center px-0 sm:px-4 py-4 sm:py-10 font-['Plus_Jakarta_Sans'] overflow-y-auto">
                {apiStatus === 'PENDING' && renderPendingState()}
                {apiStatus === 'REJECTED' && renderRejectedState()}
                {apiStatus === 'APPROVED' && renderApprovedState()}
            </div>
        </AuthLayout>
    );
};

export default ApplicationStatus;
