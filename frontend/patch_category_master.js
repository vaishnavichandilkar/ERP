const fs = require('fs');
const path = require('path');

const file = path.join('c:', 'Users', 'Sahil Shipurkar', 'Downloads', 'G-MARK', 'weighting_scale', 'frontend', 'src', 'pages', 'dashboard', 'masters', 'CategoryMaster.jsx');
let content = fs.readFileSync(file, 'utf8');

// 1. Imports
content = content.replace(
    /import React, { useState, useMemo, useRef, useEffect } from 'react';\nimport { Search, Download, Filter, Plus, Minus, FileText, FileSpreadsheet, Maximize2, Minimize2, MoreVertical, CheckCircle2, XCircle, ArrowLeft, ArrowRight, ChevronDown, RefreshCw, X } from 'lucide-react';\nimport { useTranslation } from 'react-i18next';\nimport CategoryForm from '.\/components\/CategoryForm';\nimport { exportToPDF, exportToExcel } from '..\/..\/..\/utils\/exportUtils';/,
    `import React, { useState, useRef, useEffect } from 'react';
import { Search, Download, Filter, Plus, Minus, FileText, FileSpreadsheet, Maximize2, Minimize2, MoreVertical, CheckCircle2, XCircle, ArrowLeft, ArrowRight, ChevronDown, RefreshCw, X, Edit, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-hot-toast';
import CategoryForm from './components/CategoryForm';
import { exportToPDF, exportToExcel } from '../../../utils/exportUtils';
import categoryService from '../../../services/masters/categoryService';`
);

// 2. State & Fetch
content = content.replace(
    /    const exportRef = useRef\(null\);\n\n    const masterData = useMemo\(\(\) => \(\[\s*\{ id: 'cat-silage',.*?\],\s*const \[itemStatuses, setItemStatuses\] = useState\(\{.*?\}\);\n    const \[activeRowDropdown, setActiveRowDropdown\] = useState\(null\);/s,
    `    const exportRef = useRef(null);

    const [masterData, setMasterData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeRowDropdown, setActiveRowDropdown] = useState(null);

    const fetchCategories = async () => {
        setIsLoading(true);
        try {
            const data = await categoryService.getCategories();
            const mappedData = data.map(cat => ({
                id: cat.id,
                name: cat.name,
                status: cat.status,
                items: cat.sub_categories || []
            }));
            setMasterData(mappedData);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to fetch categories');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => { fetchCategories(); }, []);`
);

// 3. filteredData
content = content.replace(
    /    const filteredData = \(\) => \{\n        let data = masterData;\n        \n        \/\/ Apply search\n        if \(searchQuery\) \{\n            const q = searchQuery\.toLowerCase\(\);\n            data = data\.filter\(section => \{\n                const nameMatch = section\.name\.toLowerCase\(\)\.includes\(q\);\n                const itemsMatch = section\.items\.some\(item => item\.toLowerCase\(\)\.includes\(q\)\);\n                return nameMatch \|\| itemsMatch;\n            \}\);\n        \}\n\n        \/\/ Apply status filter\n        if \(appliedFilters\.status\) \{\n            data = data\.filter\(section => \{\n                const status = itemStatuses\[\`group-\$\{section\.id\}\`\] \|\| 'Active';\n                return status\.toLowerCase\(\) === appliedFilters\.status\.toLowerCase\(\);\n            \}\);\n        \}\n\n        return data;\n    \};/,
    `    const filteredData = () => {
        let data = masterData;
        
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            data = data.filter(section => {
                const nameMatch = section.name.toLowerCase().includes(q);
                const itemsMatch = section.items.some(item => (item.name || '').toLowerCase().includes(q));
                return nameMatch || itemsMatch;
            });
        }

        if (appliedFilters.status) {
            data = data.filter(section => {
                const status = section.status || 'ACTIVE';
                return status.toLowerCase() === appliedFilters.status.toLowerCase();
            });
        }

        return data;
    };`
);

// 4. toggle status
content = content.replace(
    /    const handleToggleStatus = \(dropdownId, currentStatus\) => \{\n        setItemStatuses\(prev => \(\{\n            \.\.\.prev,\n            \[dropdownId\]: currentStatus === 'Active' \? 'Inactive' : 'Active'\n        \}\)\);\n        setActiveRowDropdown\(null\);\n    \};/,
    `    const handleToggleStatus = async (id, currentStatus, type) => {
        try {
            const newStatus = currentStatus === 'INACTIVE' ? 'ACTIVE' : 'INACTIVE';
            if (type === 'category') {
                await categoryService.toggleCategoryStatus(id, newStatus);
            } else {
                await categoryService.toggleSubCategoryStatus(id, newStatus);
            }
            toast.success(newStatus === 'ACTIVE' ? 'Activated successfully' : 'Inactivated successfully');
            fetchCategories(); // Refresh data
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update status');
        } finally {
            setActiveRowDropdown(null);
        }
    };`
);

// 5. PDF export
content = content.replace(
    /sec\.items\.forEach\(\(item, idx\) => \{\n                    tableRows\.push\(\[\`\$\{idx \+ 1\}\.\`, item\]\);\n                \}\);/,
    `sec.items.forEach((item, idx) => {\n                    tableRows.push([\`\${idx + 1}.\`, item.name]);\n                });`
);

// 6. Excel export
content = content.replace(
    /sec\.items\.forEach\(item => \{\n                    data\.push\(\{ \[t\('common:type'\)\]: '', \[t\('modules:category_name'\)\]: '', \[t\('modules:sub_category'\)\]: item \}\);\n                \}\);/,
    `sec.items.forEach(item => {\n                    data.push({ [t('common:type')]: '', [t('modules:category_name')]: '', [t('modules:sub_category')]: item.name });\n                });`
);

fs.writeFileSync(file, content);
console.log('Update Phase 1 successful');
