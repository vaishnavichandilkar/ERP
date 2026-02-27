import React from 'react';
import { Menu, Printer, Wifi, Settings as SettingsIcon, HelpCircle, Search, Bell, User } from 'lucide-react';

const Header = ({ setSidebarOpen }) => {
    // For visual representation only. Mocking an 'off' / 'on' state. You can hook this up to actual state later.
    const isConnected = false;

    return (
        <header className="h-[72px] bg-white border-b border-[#E5E7EB] px-4 lg:px-6 flex items-center justify-between shrink-0">
            {/* Left Box: Menu button + Title */}
            <div className="flex items-center gap-4">
                <button
                    onClick={() => setSidebarOpen(true)}
                    className="p-1 lg:hidden text-[#4B5563] hover:text-[#111827] focus:outline-none"
                >
                    <Menu size={24} />
                </button>
                <div className="flex items-center gap-2 text-[#4B5563] text-[15px] font-medium">
                    <div className="bg-[#F3F4F6] p-1.5 rounded-[8px] flex items-center justify-center">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>
                    </div>
                    Dashboard
                </div>
            </div>

            {/* Right Box: Setup icons */}
            <div className="flex items-center gap-4 lg:gap-5">
                {/* Indicator Group */}
                <div className="hidden md:flex items-center gap-4 lg:gap-5 border-r border-[#E5E7EB] pr-4 lg:pr-5">
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
                    <button className="text-[#374151] hover:text-[#111827] transition-colors hidden sm:block">
                        <HelpCircle size={20} strokeWidth={2} />
                    </button>
                    <button className="text-[#374151] hover:text-[#111827] transition-colors">
                        <Search size={20} strokeWidth={2} />
                    </button>
                    <button className="text-[#374151] hover:text-[#111827] transition-colors">
                        <Bell size={20} strokeWidth={2} />
                    </button>

                    <button className="bg-[#84CC16] text-white w-[38px] h-[38px] rounded-full flex items-center justify-center font-semibold border-2 border-white shadow-sm ml-1 hover:bg-[#65A30D] transition-colors overflow-hidden">
                        <User size={22} className="mt-1" strokeWidth={1.5} />
                    </button>
                </div>
            </div>
        </header>
    );
};

export default Header;
