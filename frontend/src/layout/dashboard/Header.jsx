import React from 'react';
import { Menu, Printer, Wifi, Settings as SettingsIcon, HelpCircle, Search, Bell, User, Globe, ChevronDown } from 'lucide-react';
import logo from '../../assets/images/logo2.png';

const Header = ({ setSidebarOpen }) => {
    // For visual representation only. Mocking an 'off' / 'on' state.
    const isConnected = false;

    return (
        <header className="h-[64px] lg:h-[72px] bg-white border-b border-[#E5E7EB] px-3 lg:px-6 flex items-center justify-between shrink-0">
            {/* Left Box: Menu button + Title/Logo */}
            <div className="flex items-center gap-2 lg:gap-4">
                <button
                    onClick={() => setSidebarOpen(true)}
                    className="p-1 lg:hidden text-[#4B5563] hover:text-[#111827] focus:outline-none"
                >
                    <Menu size={20} />
                </button>
                <div className="hidden lg:flex items-center gap-2 text-[#4B5563] text-[15px] font-medium">
                    <div className="bg-[#F3F4F6] p-1.5 rounded-[8px] flex items-center justify-center">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>
                    </div>
                    Dashboard
                </div>
                {/* Mobile Logo */}
                <img src={logo} alt="WeighPro Logo" className="h-[14px] ml-1 lg:hidden block" onError={(e) => { e.target.style.display = 'none' }} />
            </div>

            {/* Right Box: Setup icons */}
            <div className="flex items-center gap-2 lg:gap-5">
                {/* Indicator Group */}
                <div className="hidden lg:flex items-center gap-4 lg:gap-5 border-r border-[#E5E7EB] pr-4 lg:pr-5">
                    <div className="flex items-center gap-1.5">
                        <Printer size={18} className={isConnected ? "text-[#22C55E]" : "text-[#EF4444] opacity-80"} />
                        <span className={`text-[14px] font-medium ${isConnected ? "text-[#22C55E]" : "text-[#EF4444] opacity-80"}`}>
                            {isConnected ? 'On' : 'Off'}
                        </span>
                    </div>
                    <div className="w-px h-4 bg-[#E5E7EB]"></div>
                    <div className="flex items-center gap-1.5">
                        <Wifi size={18} className={isConnected ? "text-[#22C55E]" : "text-[#EF4444] opacity-80"} />
                        <span className={`text-[14px] font-medium ${isConnected ? "text-[#22C55E]" : "text-[#EF4444] opacity-80"}`}>
                            {isConnected ? 'On' : 'Off'}
                        </span>
                    </div>
                    <div className="w-px h-4 bg-[#E5E7EB]"></div>
                    <div className="flex items-center gap-1.5">
                        <SettingsIcon size={18} className={isConnected ? "text-[#22C55E]" : "text-[#EF4444] opacity-80"} />
                        <span className={`text-[14px] font-medium ${isConnected ? "text-[#22C55E]" : "text-[#EF4444] opacity-80"}`}>
                            {isConnected ? 'On' : 'Off'}
                        </span>
                    </div>
                </div>

                {/* Rightmost Action icons */}
                <div className="flex items-center gap-3 lg:gap-4">
                    {/* Globe specifically shown on mobile */}
                    <button className="text-[#4B5563] hover:text-[#111827] lg:hidden flex items-center transition-colors">
                        <Globe size={18} strokeWidth={1.5} />
                        <ChevronDown size={14} strokeWidth={1.5} className="ml-0.5" />
                    </button>
                    <button className="hidden lg:block text-[#4B5563] hover:text-[#111827] transition-colors">
                        <HelpCircle size={20} strokeWidth={1.5} />
                    </button>
                    <button className="text-[#4B5563] hover:text-[#111827] transition-colors">
                        <Search size={18} className="lg:w-[20px] lg:h-[20px]" strokeWidth={1.5} />
                    </button>
                    <button className="text-[#4B5563] hover:text-[#111827] transition-colors">
                        <Bell size={18} className="lg:w-[20px] lg:h-[20px]" strokeWidth={1.5} />
                    </button>

                    <button className="bg-[#65A30D] text-white w-[28px] h-[28px] lg:w-[38px] lg:h-[38px] rounded-full flex items-center justify-center font-semibold border border-white shadow-sm hover:bg-[#4D7C0F] transition-colors overflow-hidden">
                        <User size={18} className="mt-1 lg:hidden" strokeWidth={1.5} />
                        <User size={22} className="mt-1 hidden lg:block" strokeWidth={1.5} />
                    </button>
                </div>
            </div>
        </header>
    );
};

export default Header;
