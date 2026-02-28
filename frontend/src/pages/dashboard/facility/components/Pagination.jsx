import React from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';

const Pagination = () => {
    return (
        <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-4 border-t border-gray-100 gap-4 bg-white rounded-b-xl">
            <div className="flex items-center text-sm text-gray-600 font-medium">
                <span>Show</span>
                <select className="mx-2 bg-gray-50 border border-gray-200 rounded-md py-1.5 px-3 text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#014A36] transition-colors cursor-pointer appearance-none">
                    <option>5</option>
                    <option>10</option>
                    <option>20</option>
                </select>
                <span>per page</span>
            </div>

            <div className="flex items-center gap-6 text-sm text-gray-500 font-medium">
                <span>1-10 of 52</span>
                <div className="flex items-center gap-1.5">
                    <button className="p-1.5 hover:bg-gray-100 rounded-md text-gray-400 hover:text-gray-800 transition-colors">
                        <ArrowLeft size={16} />
                    </button>
                    <button className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-gray-100 text-gray-600 transition-colors">1</button>
                    <button className="w-8 h-8 flex items-center justify-center rounded-md bg-gray-100 text-gray-900 font-semibold">2</button>
                    <button className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-gray-100 text-gray-600 transition-colors">3</button>
                    <button className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-gray-100 text-gray-600 transition-colors">4</button>
                    <button className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-gray-100 text-gray-600 transition-colors">5</button>
                    <button className="p-1.5 hover:bg-gray-100 rounded-md text-gray-400 hover:text-gray-800 transition-colors">
                        <ArrowRight size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Pagination;
