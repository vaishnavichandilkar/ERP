import React from 'react';
import illustration from '../../assets/images/waighingscale1.png';

const AuthLayout = ({ children, maxWidth = 'max-w-[480px]', hideLeftPanel = false }) => {
    return (
        <div className="flex w-full min-h-screen flex-col md:flex-row h-auto md:h-screen overflow-auto md:overflow-hidden bg-[#F8FAF0]">
            {/* Left Panel - Fixed */}
            <div className={`
                ${hideLeftPanel ? 'hidden' : 'flex'} md:flex 
                w-full md:w-[33.05%] basis-full md:basis-[33.05%] md:max-w-[33.05%] 
                h-auto md:h-full 
                flex-col justify-center p-8 md:px-6 md:py-8 text-white relative overflow-hidden
                bg-gradient-to-br from-[#9ACD32] to-[#0B3D2E]
            `}>
                <div className="w-full h-full flex flex-col justify-center relative z-10">
                    <h1 className="text-[30px] font-['Geist_Sans'] font-bold mb-4 leading-tight tracking-tight text-white">
                        Enterprise-grade <span className="bg-[#073318] px-2 py-0.5 rounded ml-0.5 text-white shadow-sm inline-block">accuracy</span><br />
                        for critical<br />
                        <span className="bg-[#073318] px-2 py-0.5 rounded mr-0.5 text-white shadow-sm inline-block mt-1">Weighing</span> operations
                    </h1>

                    <p className="text-[14px] font-['Plus_Jakarta_Sans'] font-medium opacity-90 max-w-[90%] mb-8 leading-relaxed text-white">
                        A reliable weighing management solution built to deliver precise measurements, secure data handling, and operational efficiency across business and industrial environments.
                    </p>

                    {/* Illustration */}
                    <img
                        src={illustration}
                        alt="Weighing Illustration"
                        className="mt-auto w-full h-auto drop-shadow-[0_10px_15px_rgba(0,0,0,0.2)] block"
                    />
                </div>
            </div>

            {/* Right Panel - Scrollable */}
            <div className="flex-1 w-full md:w-[66.95%] basis-full md:basis-[66.95%] md:max-w-[66.95%] min-h-screen md:min-h-0 h-auto md:h-full overflow-visible md:overflow-y-auto bg-white flex flex-col items-center font-sans">
                <div className={`w-full p-6 md:p-8 box-border grow flex flex-col justify-center min-h-min ${maxWidth}`}>
                    {children}
                </div>
            </div>
        </div>
    );
};

export default AuthLayout;



