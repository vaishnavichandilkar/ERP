import os

path = 'c:/Users/user/Desktop/weighting_scale/frontend/src/pages/dashboard/masters/AccountMaster.jsx'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace imports
if "react-redux" not in content:
    content = content.replace("import React, { useState, useRef, useEffect } from 'react';", "import React, { useState, useRef, useEffect } from 'react';\nimport { useSelector, useDispatch } from 'react-redux';\nimport { fetchAllAccounts, toggleAccountStatus } from '../../../redux/account/accountSlice';")
    content = content.replace("import { translateDynamic } from '../../../utils/i18nUtils';", "import { translateDynamic } from '../../../utils/i18nUtils';\nimport accountService from '../../../services/accountService';")

# Find tableData state
start = content.find('const [tableData, setTableData] = useState([')
if start != -1:
    end = content.find(']);', start) + 3
    replacement = """    const dispatch = useDispatch();
    const { accounts, total: totalItems, totalPages, loading } = useSelector(state => state.account);
    const paginatedData = accounts || [];"""
    content = content[:start] + replacement + content[end:]

# Find filteredData
start2 = content.find('const filteredData = tableData.filter(row => {')
if start2 != -1:
    end2 = content.find('});', start2) + 3
    content = content[:start2] + content[end2:]

# Find pagination logic
start3 = content.find('const totalItems = filteredData.length;')
if start3 != -1:
    end3 = content.find('const paginatedData = filteredData.slice(startIndex, endIndex);', start3) + 63
    replacement3 = """    useEffect(() => {
        const params = {
            page: currentPage,
            limit: rowsPerPage,
            search: searchQuery,
            ...appliedFilters
        };
        if (params.status === 'Active') params.isActive = true;
        else if (params.status === 'InActive') params.isActive = false;
        
        Object.keys(params).forEach(k => {
            if (params[k] === '' || params[k] === undefined) {
                delete params[k];
            }
        });
        
        dispatch(fetchAllAccounts(params));
    }, [dispatch, currentPage, rowsPerPage, searchQuery, appliedFilters]);

    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = Math.min(startIndex + rowsPerPage, totalItems || 0);"""
    content = content[:start3] + replacement3 + content[end3:]

# Replace setTableData
content = content.replace("setTableData([newAccount, ...tableData]);", "dispatch(fetchAllAccounts({ page: currentPage, limit: rowsPerPage, search: searchQuery, ...appliedFilters }));")
content = content.replace("setTableData(tableData.map(row => row.code === updatedAccount.code ? updatedAccount : row));", "dispatch(fetchAllAccounts({ page: currentPage, limit: rowsPerPage, search: searchQuery, ...appliedFilters }));")

start4 = content.find('const toggleStatus = (code, currentStatus, event) => {')
if start4 != -1:
    end4 = content.find('};', start4) + 2
    replacement4 = """    const toggleStatus = async (id, event) => {
        event.stopPropagation();
        await dispatch(toggleAccountStatus(id));
        dispatch(fetchAllAccounts({ page: currentPage, limit: rowsPerPage, search: searchQuery, ...appliedFilters }));
        setDropdownIndex(null);
    };"""
    content = content[:start4] + replacement4 + content[end4:]

content = content.replace("onClick={(e) => toggleStatus(row.code, row.status, e)}", "onClick={(e) => toggleStatus(row.id, e)}")

# Update Export
start5 = content.find('const handleExportPDF = () => {')
if start5 != -1:
    end5 = content.find('setIsExportOpen(false);\n    };', start5) + 31
    replacement5 = """    const handleExportPDF = async () => {
        setIsExportOpen(false);
        try {
            const params = { format: 'pdf', search: searchQuery, ...appliedFilters };
            if (params.status === 'Active') params.isActive = true;
            else if (params.status === 'InActive') params.isActive = false;
            
            const response = await accountService.exportAccounts(params);
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'account-master.pdf');
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
        } catch (e) {
            console.error('Export failed', e);
        }
    };"""
    content = content[:start5] + replacement5 + content[end5:]

start6 = content.find('const handleExportExcel = () => {')
if start6 != -1:
    end6 = content.find('setIsExportOpen(false);\n    };', start6) + 31
    replacement6 = """    const handleExportExcel = async () => {
        setIsExportOpen(false);
        try {
            const params = { format: 'xlsx', search: searchQuery, ...appliedFilters };
            if (params.status === 'Active') params.isActive = true;
            else if (params.status === 'InActive') params.isActive = false;
            
            const response = await accountService.exportAccounts(params);
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'account-master.xlsx');
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
        } catch (e) {
            console.error('Export failed', e);
        }
    };"""
    content = content[:start6] + replacement6 + content[end6:]

# Table modifications
content = content.replace("row.status.toUpperCase() === 'ACTIVE'", "row.isActive")
# Let's fix text display condition:
content = content.replace("row.isActive ? 'text-[#014A36] font-medium' : 'text-gray-500'", "row.isActive ? 'text-[#014A36] font-medium' : 'text-gray-500'")
content = content.replace("row.isActive ? t('common:active') : t('common:inactive')", "row.isActive ? t('common:active') : t('common:inactive')")
content = content.replace("row.isActive ? 'text-gray-500' : 'text-[#014A36]'", "row.isActive ? 'text-gray-500' : 'text-[#014A36]'")

content = content.replace("row.address", "row.addressLine1")
content = content.replace("row.bankAccountNo", "row.accountNumber")
content = content.replace("row.opBalance", "row.openingBalance")

# Final verification to write
with open(path, 'w', encoding='utf-8') as f:
    f.write(content)

print("done")
