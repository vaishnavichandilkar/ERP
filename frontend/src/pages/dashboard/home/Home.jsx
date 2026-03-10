import React from 'react';
import { useTranslation } from 'react-i18next';

const Home = () => {
    const { t } = useTranslation(['dashboard']);
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const firstName = user.first_name || 'Seller';

    return (
        <div className="flex flex-col w-full max-w-[1400px] mx-auto pb-10">
            {/* Blank Dashboard Page */}
            <div className="flex items-center justify-between mb-5 md:mb-8 pt-1">
                <div>

                </div>
            </div>
            {/* Content will go here */}
        </div>
    );
};

export default Home;
