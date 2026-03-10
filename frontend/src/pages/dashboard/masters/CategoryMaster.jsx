import React from 'react';
import { useTranslation } from 'react-i18next';

const CategoryMaster = () => {
    const { t } = useTranslation('modules');
    return (
        <div className="bg-white rounded-xl border border-[#E5E7EB] p-8 shadow-[0_1px_3px_rgba(0,0,0,0.05)] min-h-[400px]">
            <h2 className="text-xl font-bold text-gray-800 mb-4">{t('category')}</h2>
            <p className="text-gray-500">{t('category_desc')}</p>
        </div>
    );
};

export default CategoryMaster;
