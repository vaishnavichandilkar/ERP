import React, { useState, useEffect, useRef } from 'react';
import { Search, X, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

// Expanded mock data to ensure scrolling (more than 5 items)
const mockProducts = [
    { id: 1, name: 'Murgas', category: 'Animal Feed', vendor: 'Shree Ram Feed', img: 'https://placehold.co/100x100/EEE/31343C?text=M' },
    { id: 2, name: 'Makka', category: 'Animal Feed', vendor: 'GreenGrow Traders', img: 'https://placehold.co/100x100/EEE/31343C?text=M' },
    { id: 3, name: 'Pend', category: 'Animal Feed', vendor: 'AgroPlus Industries', img: 'https://placehold.co/100x100/EEE/31343C?text=P' },
    { id: 4, name: 'Sorghum', category: 'Animal Feed', vendor: 'Mahesh Agro Traders', img: 'https://placehold.co/100x100/EEE/31343C?text=S' },
    { id: 5, name: 'Soybean Pend', category: 'Animal Feed', vendor: 'Patil Krushi Traders', img: 'https://placehold.co/100x100/EEE/31343C?text=SP' },
    { id: 6, name: 'Layer Mash', category: 'Poultry Feed', vendor: 'AgroPlus Industries', img: 'https://placehold.co/100x100/EEE/31343C?text=LM' },
    { id: 7, name: 'Starter Feed', category: 'Poultry Feed', vendor: 'GreenGrow Traders', img: 'https://placehold.co/100x100/EEE/31343C?text=SF' },
];

const mockCustomers = [
    { id: 1, name: 'Mahadev Patil', email: 'mahadev@gmail.com', location: 'Chandgad', avatar: 'https://ui-avatars.com/api/?name=Mahadev+Patil&background=10B981&color=fff' },
    { id: 2, name: 'Adwaita Shinde', email: 'adwaita@gmail.com', location: 'Gadhinglaj', avatar: 'https://ui-avatars.com/api/?name=Adwaita+Shinde&background=3B82F6&color=fff' },
    { id: 3, name: 'Pooja Shimpi', email: 'pooja@gmail.com', location: 'Belgaum', avatar: 'https://ui-avatars.com/api/?name=Pooja+Shimpi&background=EF4444&color=fff' },
    { id: 4, name: 'Sahil Shipurkar', email: 'sahil@gmail.com', location: 'Gadhinglaj', avatar: 'https://ui-avatars.com/api/?name=Sahil+Shipurkar&background=10B981&color=fff' },
    { id: 5, name: 'Ritesh Honole', email: 'ritesh@gmail.com', location: 'Belgaum', avatar: 'https://ui-avatars.com/api/?name=Ritesh+Honole&background=10B981&color=fff' },
    { id: 6, name: 'Vijay Kumar', email: 'vijay@gmail.com', location: 'Kolhapur', avatar: 'https://ui-avatars.com/api/?name=Vijay+Kumar&background=F59E0B&color=fff' },
    { id: 7, name: 'Neha Sharma', email: 'neha.s@gmail.com', location: 'Pune', avatar: 'https://ui-avatars.com/api/?name=Neha+Sharma&background=8B5CF6&color=fff' },
];

const mockUsers = [
    { id: 1, name: 'Amit Kulkarni', email: 'amit@gmail.com', location: 'Kolhapur', role: 'Admin', avatar: 'https://ui-avatars.com/api/?name=Amit+Kulkarni&background=F59E0B&color=fff' },
    { id: 2, name: 'Sneha Deshmukh', email: 'sneha@gmail.com', location: 'Pune', role: 'Admin', avatar: 'https://ui-avatars.com/api/?name=Sneha+Deshmukh&background=8B5CF6&color=fff' },
    { id: 3, name: 'Rohit Patil', email: 'rohit@gmail.com', location: 'Sangli', role: 'Admin', avatar: 'https://ui-avatars.com/api/?name=Rohit+Patil&background=10B981&color=fff' },
    { id: 4, name: 'Neha Jadhav', email: 'neha@gmail.com', location: 'Satara', role: 'Admin', avatar: 'https://ui-avatars.com/api/?name=Neha+Jadhav&background=EF4444&color=fff' },
    { id: 5, name: 'Arun Chavan', email: 'arun@gmail.com', location: 'Solapur', role: 'Admin', avatar: 'https://ui-avatars.com/api/?name=Arun+Chavan&background=3B82F6&color=fff' },
    { id: 6, name: 'Priya Singh', email: 'priya@gmail.com', location: 'Mumbai', role: 'Editor', avatar: 'https://ui-avatars.com/api/?name=Priya+Singh&background=EC4899&color=fff' },
    { id: 7, name: 'Rahul Dev', email: 'rahul@gmail.com', location: 'Nagpur', role: 'Viewer', avatar: 'https://ui-avatars.com/api/?name=Rahul+Dev&background=6366F1&color=fff' },
];

const mockInventory = [
    { id: 1, name: 'Makka', category: 'Animal Feed', qty: '120 kg', status: 'In Stock', statusColor: 'text-green-600', dotColor: 'bg-green-600', img: 'https://placehold.co/100x100/EEE/31343C?text=M' },
    { id: 2, name: 'Pend', category: 'Animal Feed', qty: '10 bags', status: 'Low Stock', statusColor: 'text-orange-500', dotColor: 'bg-orange-500', img: 'https://placehold.co/100x100/EEE/31343C?text=P' },
    { id: 3, name: 'Soybean Pend', category: 'Animal Feed', qty: '120 bags', status: 'In Stock', statusColor: 'text-green-600', dotColor: 'bg-green-600', img: 'https://placehold.co/100x100/EEE/31343C?text=SP' },
    { id: 4, name: 'Murgas', category: 'Animal Feed', qty: '120 kg', status: 'In Stock', statusColor: 'text-green-600', dotColor: 'bg-green-600', img: 'https://placehold.co/100x100/EEE/31343C?text=M' },
    { id: 5, name: 'Sorghum', category: 'Animal Feed', qty: '0 kg', status: 'Out of Stock', statusColor: 'text-red-500', dotColor: 'bg-red-500', img: 'https://placehold.co/100x100/EEE/31343C?text=S' },
    { id: 6, name: 'Layer Mash', category: 'Poultry Feed', qty: '50 bags', status: 'In Stock', statusColor: 'text-green-600', dotColor: 'bg-green-600', img: 'https://placehold.co/100x100/EEE/31343C?text=LM' },
    { id: 7, name: 'Starter Feed', category: 'Poultry Feed', qty: '5 bags', status: 'Low Stock', statusColor: 'text-orange-500', dotColor: 'bg-orange-500', img: 'https://placehold.co/100x100/EEE/31343C?text=SF' },
];

const SearchPopup = ({ isOpen, activeTrigger, onClose }) => {
    const { t } = useTranslation('dashboard');
    const tabs = [
        { id: 'All', label: t('all_tab') },
        { id: 'Product', label: t('product_tab') },
        { id: 'Customer', label: t('customer_tab') },
        { id: 'Users', label: t('users_tab') },
        { id: 'Inventory', label: t('inventory_tab') }
    ];

    const [activeTab, setActiveTab] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [isVisible, setIsVisible] = useState(false);
    const popupRef = useRef(null);
    const navigate = useNavigate();

    // Handle animations and scroll lock logic
    useEffect(() => {
        const mainEl = document.querySelector('main');

        if (isOpen) {
            setIsVisible(true);
            document.documentElement.style.overflow = 'hidden';
            document.body.style.overflow = 'hidden';
            if (mainEl) {
                mainEl.style.overflow = 'hidden';
            }
        } else {
            const timer = setTimeout(() => setIsVisible(false), 300);
            document.documentElement.style.overflow = '';
            document.body.style.overflow = '';
            if (mainEl) mainEl.style.overflow = '';
            return () => clearTimeout(timer);
        }

        // Cleanup function for unmount
        return () => {
            document.documentElement.style.overflow = '';
            document.body.style.overflow = '';
            if (mainEl) mainEl.style.overflow = '';
        }
    }, [isOpen]);

    // Close on click outside or ESC
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (popupRef.current && !popupRef.current.contains(event.target)) {
                onClose();
            }
        };

        const handleEscape = (event) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            document.addEventListener('keydown', handleEscape);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleEscape);
        };
    }, [isOpen, onClose]);

    if (!isVisible && !isOpen) return null;

    const handleNavigation = (path) => {
        onClose();
        // navigate(path); // Uncomment when actual routes are defined
    };

    return (
        <div
            className={`fixed inset-0 z-50 flex justify-center items-start pt-[72px] md:pt-[76px] px-3 md:px-0 bg-slate-900/20 backdrop-blur-[2px] transition-all duration-300 ease-in-out ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}
            ${activeTrigger === 'search' ? 'md:pr-[90px] lg:pr-[110px]' : activeTrigger === 'notification' ? 'md:pr-[40px] lg:pr-[60px]' : 'md:pr-6 md:justify-end'}`}
            style={{
                justifyContent: window.innerWidth >= 768 ? 'flex-end' : 'center'
            }}
        >
            <div className="relative flex flex-col items-end w-full md:w-auto">
                {/* Visual Tether Arrow */}
                <div
                    className={`absolute -top-1.5 md:-top-2 right-[92px] md:right-6 w-3.5 h-3.5 md:w-4 md:h-4 bg-white transform rotate-45 border-l border-t border-gray-100 transition-all duration-300 ease-in-out ${isOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-90'}`}
                />

                <div
                    ref={popupRef}
                    className={`bg-white w-full md:w-[600px] flex flex-col rounded-[16px] shadow-[0_10px_40px_rgba(0,0,0,0.15)] overflow-hidden transition-all duration-300 ease-in-out transform max-h-[85vh] md:max-h-[520px] origin-top md:origin-top-right ${isOpen ? 'translate-y-0 scale-100 opacity-100' : '-translate-y-4 md:translate-y-0 scale-95 md:scale-90 opacity-0'}`}
                >
                    {/* Header (Search Input) */}
                    <div className="flex items-center p-4 border-b border-gray-100 shrink-0">
                        <Search className="w-5 h-5 text-gray-400 ml-2" />
                        <input
                            type="text"
                            placeholder={t('search_placeholder')}
                            className="w-full bg-transparent border-none outline-none px-4 text-[15px] font-medium text-gray-800 placeholder-gray-400"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            autoFocus
                        />
                        <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-full transition-colors">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Tabs */}
                    <div className="relative border-b border-gray-100 px-2 shrink-0 overflow-x-auto hide-scrollbar">
                        <div className="flex px-4 min-w-max">
                            {tabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`relative px-4 py-3.5 text-[14px] font-medium transition-colors ${activeTab === tab.id ? 'text-[#166534]' : 'text-gray-500 hover:text-gray-800'}`}
                                >
                                    {tab.label}
                                    {activeTab === tab.id && (
                                        <div className="absolute bottom-0 left-0 w-full h-[2px] bg-[#166534] rounded-t-sm" />
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Content Area */}
                    <div className="flex-1 overflow-hidden flex flex-col bg-white">
                        {/* All Tab - Empty State */}
                        {activeTab === 'All' && (
                            <div className="flex-1 min-h-[300px] flex flex-col items-center justify-center text-center p-8 animate-in fade-in zoom-in duration-300">
                                <h3 className="text-[17px] font-semibold text-gray-800 mb-2">{t('looking_for_something')}</h3>
                                <p className="text-[14px] text-gray-500 max-w-[280px]">{t('initiate_experience')}</p>
                            </div>
                        )}

                        {/* Product Tab */}
                        {activeTab === 'Product' && (
                            <div className="flex flex-col h-full overflow-hidden animate-in fade-in slide-in-from-right-4 duration-300">
                                <div className="flex-1 overflow-y-auto max-h-[360px] px-2 py-2 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-gray-200 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent pr-1">
                                    {mockProducts.map((product) => (
                                        <div key={product.id} className="flex items-center px-4 py-3 hover:bg-gray-50 rounded-[12px] cursor-pointer group transition-colors">
                                            <img src={product.img} alt={product.name} className="w-[46px] h-[46px] rounded-full object-cover bg-gray-100" />
                                            <div className="ml-4 flex-1">
                                                <h4 className="text-[15px] font-semibold text-gray-800 group-hover:text-[#166534] transition-colors">{product.name}</h4>
                                                <p className="text-[13px] text-gray-500">{product.category} | {product.vendor}</p>
                                            </div>
                                            <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-[#166534] transition-colors" />
                                        </div>
                                    ))}
                                </div>
                                <div className="p-4 pt-3 bg-white border-t border-gray-50 shrink-0">
                                    <button className="w-full py-2.5 bg-white border border-gray-200 text-gray-700 text-[14px] font-semibold rounded-[8px] hover:border-[#166534] hover:text-[#166534] hover:bg-green-50 transition-all shadow-sm">
                                        {t('go_to_product_mgmt')}
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Customer Tab */}
                        {activeTab === 'Customer' && (
                            <div className="flex flex-col h-full overflow-hidden animate-in fade-in slide-in-from-right-4 duration-300">
                                <div className="flex-1 overflow-y-auto max-h-[360px] px-2 py-2 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-gray-200 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent pr-1">
                                    {mockCustomers.map((customer) => (
                                        <div key={customer.id} className="flex items-center px-4 py-3 hover:bg-gray-50 rounded-[12px] cursor-pointer group transition-colors">
                                            <img src={customer.avatar} alt={customer.name} className="w-[46px] h-[46px] rounded-full object-cover" />
                                            <div className="ml-4 flex-1">
                                                <h4 className="text-[15px] font-semibold text-gray-800 group-hover:text-[#166534] transition-colors">{customer.name}</h4>
                                                <p className="text-[13px] text-gray-500">{customer.email} | {customer.location}</p>
                                            </div>
                                            <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-[#166534] transition-colors" />
                                        </div>
                                    ))}
                                </div>
                                <div className="p-4 pt-3 bg-white border-t border-gray-50 shrink-0">
                                    <button className="w-full py-2.5 bg-white border border-gray-200 text-gray-700 text-[14px] font-semibold rounded-[8px] hover:border-[#166534] hover:text-[#166534] hover:bg-green-50 transition-all shadow-sm">
                                        {t('go_to_customer_mgmt')}
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Users Tab */}
                        {activeTab === 'Users' && (
                            <div className="flex flex-col h-full overflow-hidden animate-in fade-in slide-in-from-right-4 duration-300">
                                <div className="flex-1 overflow-y-auto max-h-[360px] px-2 py-2 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-gray-200 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent pr-1">
                                    {mockUsers.map((user) => (
                                        <div key={user.id} className="flex items-center px-4 py-3 hover:bg-gray-50 rounded-[12px] cursor-pointer group transition-colors">
                                            <img src={user.avatar} alt={user.name} className="w-[46px] h-[46px] rounded-full object-cover" />
                                            <div className="ml-4 flex-1">
                                                <h4 className="text-[15px] font-semibold text-gray-800 group-hover:text-[#166534] transition-colors">{user.name}</h4>
                                                <p className="text-[13px] text-gray-500">{user.email} | {user.location} | {user.role}</p>
                                            </div>
                                            <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-[#166534] transition-colors" />
                                        </div>
                                    ))}
                                </div>
                                <div className="p-4 pt-3 bg-white border-t border-gray-50 shrink-0">
                                    <button className="w-full py-2.5 bg-white border border-gray-200 text-gray-700 text-[14px] font-semibold rounded-[8px] hover:border-[#166534] hover:text-[#166534] hover:bg-green-50 transition-all shadow-sm">
                                        {t('go_to_user_mgmt')}
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Inventory Tab */}
                        {activeTab === 'Inventory' && (
                            <div className="flex flex-col h-full overflow-hidden animate-in fade-in slide-in-from-right-4 duration-300">
                                <div className="flex-1 overflow-y-auto max-h-[360px] px-2 py-2 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-gray-200 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent pr-1">
                                    {mockInventory.map((item) => (
                                        <div key={item.id} className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 rounded-[12px] cursor-pointer group transition-colors">
                                            <div className="flex items-center">
                                                <img src={item.img} alt={item.name} className="w-[46px] h-[46px] rounded-full object-cover bg-gray-100" />
                                                <div className="ml-4">
                                                    <h4 className="text-[15px] font-semibold text-gray-800 group-hover:text-[#166534] transition-colors">{item.name}</h4>
                                                    <p className="text-[13px] text-gray-500">{item.category}</p>
                                                </div>
                                            </div>
                                            <div className="text-right flex flex-col items-end">
                                                <span className={`text-[14px] font-semibold ${item.qty.startsWith('0') ? 'text-gray-400' : 'text-gray-800'}`}>{item.qty} available</span>
                                                <div className="flex items-center gap-1.5 mt-0.5">
                                                    <div className={`w-1.5 h-1.5 rounded-full ${item.dotColor}`}></div>
                                                    <span className={`text-[12px] font-medium ${item.statusColor}`}>{item.status}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="p-4 pt-3 bg-white border-t border-gray-50 shrink-0">
                                    <button className="w-full py-2.5 bg-white border border-gray-200 text-gray-700 text-[14px] font-semibold rounded-[8px] hover:border-[#166534] hover:text-[#166534] hover:bg-green-50 transition-all shadow-sm">
                                        {t('go_to_inventory')}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SearchPopup;
