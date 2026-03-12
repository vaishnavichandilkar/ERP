import React, { useState, useRef, useEffect } from 'react';
import { Search, Download, Filter, MoreVertical, Eye, Edit3, CheckCircle2, ChevronDown, ArrowLeft, ArrowRight, ChevronsUpDown, X, FileText, FileSpreadsheet } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { exportToPDF, exportToExcel } from '../../../utils/exportUtils';
import AddAccount from './components/AddAccount';
import ViewAccount from './components/ViewAccount';

const AccountMaster = () => {
    const { t } = useTranslation(['common', 'modules']);
    const [dropdownIndex, setDropdownIndex] = useState(null);
    const dropdownRef = useRef(null);

    const [isExportOpen, setIsExportOpen] = useState(false);
    const exportRef = useRef(null);

    const [searchQuery, setSearchQuery] = useState('');
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [filterInputs, setFilterInputs] = useState({
        gstNo: '',
        panNo: '',
        groupName: '',
        creditDays: '',
        status: ''
    });
    const [appliedFilters, setAppliedFilters] = useState({
        gstNo: '',
        panNo: '',
        groupName: '',
        creditDays: '',
        status: ''
    });
    const [currentView, setCurrentView] = useState('list');
    const [selectedAccount, setSelectedAccount] = useState(null);

    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [currentPage, setCurrentPage] = useState(1);

    const [tableData, setTableData] = useState([
        { vendorCode: 'VEN001', account: 'Rajesh Agro Traders', groupName: 'Sundry Creditors (Vendor)', creditDays: 30, gstNo: '27AABCR2456M1ZP', panNo: 'AABCR2456M', opBalance: '₹25,000', opBalanceRaw: '1000', opBalanceType: 'Cr', address: 'Green Market Road, Nashik', address1: 'Green Market Road', address2: 'Near APMC Yard', area: 'Panchavati', pinCode: '422003', city: 'Nashik', state: 'Maharashtra', msmeId: 'UDYAM-MH-26-0067891', regUnder: 'Micro', regType: 'Trading', bankAccountNo: '458796321457', ifscCode: 'SBIN0000456', status: 'Active', accountHolder: 'Rajesh Patil', bankName: 'State Bank of India', prefix: 'Mr.', contactPersonName: 'Rajesh Patil', emailId: 'rajesh.patil@rajeshagro.in', mobileNo: '9823456789' },
        { vendorCode: 'VEN002', account: 'Meera Farm Supplies', groupName: 'Sundry Debtors', creditDays: 45, gstNo: '27AACFM7845K1ZS', panNo: 'AACFM7845K', opBalance: '₹12,500', address: 'Shanti Nagar Colony, Kolhapur', bankAccountNo: '3214578001234', ifscCode: 'ICIC001234', status: 'Active' },
        { vendorCode: 'VEN003', account: 'Shree Ganesh Enterprises', groupName: 'Sundry Debtors', creditDays: 60, gstNo: '27AAHSG3698P1ZX', panNo: 'AAHSG3698P', opBalance: '₹40,750', address: 'Industrial Area Phase 2, Pune', bankAccountNo: '789654125698', ifscCode: 'ICIC0005678', status: 'Inactive' },
        { vendorCode: 'VEN002', account: 'Meera Farm Supplies 1', groupName: 'Sundry Debtors', creditDays: 45, gstNo: '27AACFM7845K1ZS', panNo: 'AACFM7845K', opBalance: '₹12,500', address: 'Shanti Nagar Colony, Kolhapur', bankAccountNo: '3214578001234', ifscCode: 'ICIC001234', status: 'Active' },
        { vendorCode: 'VEN003', account: 'Meera Farm Supplies 2', groupName: 'Sundry Creditors', creditDays: 30, gstNo: '27AACFM7846K1ZS', panNo: 'AACFM7846K', opBalance: '₹13,000', address: 'Market Road, Nashik', bankAccountNo: '3214578001235', ifscCode: 'SBIN0000456', status: 'Active' },
        { vendorCode: 'VEN004', account: 'Meera Farm Supplies 3', groupName: 'Sundry Debtors', creditDays: 60, gstNo: '27AACFM7847K1ZS', panNo: 'AACFM7847K', opBalance: '₹14,200', address: 'Station Road, Pune', bankAccountNo: '3214578001236', ifscCode: 'HDFC0001234', status: 'Active' },
        { vendorCode: 'VEN005', account: 'Meera Farm Supplies 4', groupName: 'Sundry Creditors', creditDays: 45, gstNo: '27AACFM7848K1ZS', panNo: 'AACFM7848K', opBalance: '₹15,100', address: 'Main Bazaar, Satara', bankAccountNo: '3214578001237', ifscCode: 'ICIC001234', status: 'Active' },
        { vendorCode: 'VEN006', account: 'Meera Farm Supplies 5', groupName: 'Sundry Debtors', creditDays: 30, gstNo: '27AACFM7849K1ZS', panNo: 'AACFM7849K', opBalance: '₹16,300', address: 'MG Road, Sangli', bankAccountNo: '3214578001238', ifscCode: 'SBIN0000456', status: 'Active' },
        { vendorCode: 'VEN007', account: 'Meera Farm Supplies 6', groupName: 'Sundry Creditors', creditDays: 60, gstNo: '27AACFM7850K1ZS', panNo: 'AACFM7850K', opBalance: '₹17,000', address: 'Industrial Area, Kolhapur', bankAccountNo: '3214578001239', ifscCode: 'HDFC0001234', status: 'Active' },
        { vendorCode: 'VEN008', account: 'Meera Farm Supplies 7', groupName: 'Sundry Debtors', creditDays: 45, gstNo: '27AACFM7851K1ZS', panNo: 'AACFM7851K', opBalance: '₹18,200', address: 'Tilak Road, Pune', bankAccountNo: '3214578001240', ifscCode: 'ICIC001234', status: 'Inactive' },
        { vendorCode: 'VEN009', account: 'Meera Farm Supplies 8', groupName: 'Sundry Creditors', creditDays: 30, gstNo: '27AACFM7852K1ZS', panNo: 'AACFM7852K', opBalance: '₹19,500', address: 'College Road, Nashik', bankAccountNo: '3214578001241', ifscCode: 'SBIN0000456', status: 'Active' },
        { vendorCode: 'VEN010', account: 'Meera Farm Supplies 9', groupName: 'Sundry Debtors', creditDays: 60, gstNo: '27AACFM7853K1ZS', panNo: 'AACFM7853K', opBalance: '₹20,000', address: 'Ring Road, Solapur', bankAccountNo: '3214578001242', ifscCode: 'HDFC0001234', status: 'Active' },
        { vendorCode: 'VEN011', account: 'Meera Farm Supplies 10', groupName: 'Sundry Creditors', creditDays: 45, gstNo: '27AACFM7854K1ZS', panNo: 'AACFM7854K', opBalance: '₹21,400', address: 'Market Yard, Ahmednagar', bankAccountNo: '3214578001243', ifscCode: 'ICIC001234', status: 'Active' },
        { vendorCode: 'VEN012', account: 'Meera Farm Supplies 11', groupName: 'Sundry Debtors', creditDays: 30, gstNo: '27AACFM7855K1ZS', panNo: 'AACFM7855K', opBalance: '₹22,300', address: 'APMC Market, Karad', bankAccountNo: '3214578001244', ifscCode: 'SBIN0000456', status: 'Active' },
        { vendorCode: 'VEN013', account: 'Meera Farm Supplies 12', groupName: 'Sundry Creditors', creditDays: 60, gstNo: '27AACFM7856K1ZS', panNo: 'AACFM7856K', opBalance: '₹23,000', address: 'Bus Stand Road, Miraj', bankAccountNo: '3214578001245', ifscCode: 'HDFC0001234', status: 'Active' },
        { vendorCode: 'VEN014', account: 'Meera Farm Supplies 13', groupName: 'Sundry Debtors', creditDays: 45, gstNo: '27AACFM7857K1ZS', panNo: 'AACFM7857K', opBalance: '₹24,600', address: 'Main Road, Ichalkaranji', bankAccountNo: '3214578001246', ifscCode: 'ICIC001234', status: 'Active' },
        { vendorCode: 'VEN015', account: 'Meera Farm Supplies 14', groupName: 'Sundry Creditors', creditDays: 30, gstNo: '27AACFM7858K1ZS', panNo: 'AACFM7858K', opBalance: '₹25,000', address: 'Laxmi Road, Pune', bankAccountNo: '3214578001247', ifscCode: 'SBIN0000456', status: 'Inactive' },
        { vendorCode: 'VEN016', account: 'Meera Farm Supplies 15', groupName: 'Sundry Debtors', creditDays: 60, gstNo: '27AACFM7859K1ZS', panNo: 'AACFM7859K', opBalance: '₹26,700', address: 'Market Area, Kolhapur', bankAccountNo: '3214578001248', ifscCode: 'HDFC0001234', status: 'Active' },
        { vendorCode: 'VEN017', account: 'Meera Farm Supplies 16', groupName: 'Sundry Creditors', creditDays: 45, gstNo: '27AACFM7860K1ZS', panNo: 'AACFM7860K', opBalance: '₹27,200', address: 'Station Chowk, Sangli', bankAccountNo: '3214578001249', ifscCode: 'ICIC001234', status: 'Active' },
        { vendorCode: 'VEN018', account: 'Meera Farm Supplies 17', groupName: 'Sundry Debtors', creditDays: 30, gstNo: '27AACFM7861K1ZS', panNo: 'AACFM7861K', opBalance: '₹28,100', address: 'Shivaji Road, Satara', bankAccountNo: '3214578001250', ifscCode: 'SBIN0000456', status: 'Active' },
        { vendorCode: 'VEN019', account: 'Meera Farm Supplies 18', groupName: 'Sundry Creditors', creditDays: 60, gstNo: '27AACFM7862K1ZS', panNo: 'AACFM7862K', opBalance: '₹29,500', address: 'Old Market, Kolhapur', bankAccountNo: '3214578001251', ifscCode: 'HDFC0001234', status: 'Active' },
        { vendorCode: 'VEN020', account: 'Meera Farm Supplies 19', groupName: 'Sundry Debtors', creditDays: 45, gstNo: '27AACFM7863K1ZS', panNo: 'AACFM7863K', opBalance: '₹30,000', address: 'College Chowk, Pune', bankAccountNo: '3214578001252', ifscCode: 'ICIC001234', status: 'Active' },
        { vendorCode: 'VEN021', account: 'Meera Farm Supplies 20', groupName: 'Sundry Creditors', creditDays: 30, gstNo: '27AACFM7864K1ZS', panNo: 'AACFM7864K', opBalance: '₹31,400', address: 'Market Lane, Nashik', bankAccountNo: '3214578001253', ifscCode: 'SBIN0000456', status: 'Active' },
        { vendorCode: 'VEN022', account: 'Meera Farm Supplies 21', groupName: 'Sundry Debtors', creditDays: 60, gstNo: '27AACFM7865K1ZS', panNo: 'AACFM7865K', opBalance: '₹32,100', address: 'APMC Yard, Sangli', bankAccountNo: '3214578001254', ifscCode: 'HDFC0001234', status: 'Active' },
        { vendorCode: 'VEN023', account: 'Meera Farm Supplies 22', groupName: 'Sundry Creditors', creditDays: 45, gstNo: '27AACFM7866K1ZS', panNo: 'AACFM7866K', opBalance: '₹33,000', address: 'Market Street, Kolhapur', bankAccountNo: '3214578001255', ifscCode: 'ICIC001234', status: 'Active' },
        { vendorCode: 'VEN024', account: 'Meera Farm Supplies 23', groupName: 'Sundry Debtors', creditDays: 30, gstNo: '27AACFM7867K1ZS', panNo: 'AACFM7867K', opBalance: '₹34,800', address: 'Station Area, Pune', bankAccountNo: '3214578001256', ifscCode: 'SBIN0000456', status: 'Active' },
        { vendorCode: 'VEN025', account: 'Meera Farm Supplies 24', groupName: 'Sundry Creditors', creditDays: 60, gstNo: '27AACFM7868K1ZS', panNo: 'AACFM7868K', opBalance: '₹35,600', address: 'Main Chowk, Satara', bankAccountNo: '3214578001257', ifscCode: 'HDFC0001234', status: 'Active' },
        { vendorCode: 'VEN026', account: 'Meera Farm Supplies 25', groupName: 'Sundry Debtors', creditDays: 45, gstNo: '27AACFM7845K1ZS', panNo: 'AACFM7845K', opBalance: '₹12,500', address: 'Shanti Nagar Colony, Kolhapur', bankAccountNo: '3214578001234', ifscCode: 'ICIC001234', status: 'Active' },
        { vendorCode: 'VEN027', account: 'Meera Farm Supplies 26', groupName: 'Sundry Creditors', creditDays: 30, gstNo: '27AACFM7846K1ZS', panNo: 'AACFM7846K', opBalance: '₹13,000', address: 'Market Road, Nashik', bankAccountNo: '3214578001235', ifscCode: 'SBIN0000456', status: 'Active' },
        { vendorCode: 'VEN028', account: 'Meera Farm Supplies 27', groupName: 'Sundry Debtors', creditDays: 60, gstNo: '27AACFM7847K1ZS', panNo: 'AACFM7847K', opBalance: '₹14,200', address: 'Station Road, Pune', bankAccountNo: '3214578001236', ifscCode: 'HDFC0001234', status: 'Active' },
        { vendorCode: 'VEN029', account: 'Meera Farm Supplies 28', groupName: 'Sundry Creditors', creditDays: 45, gstNo: '27AACFM7848K1ZS', panNo: 'AACFM7848K', opBalance: '₹15,100', address: 'Main Bazaar, Satara', bankAccountNo: '3214578001237', ifscCode: 'ICIC001234', status: 'Active' },
        { vendorCode: 'VEN030', account: 'Meera Farm Supplies 29', groupName: 'Sundry Debtors', creditDays: 30, gstNo: '27AACFM7849K1ZS', panNo: 'AACFM7849K', opBalance: '₹16,300', address: 'MG Road, Sangli', bankAccountNo: '3214578001238', ifscCode: 'SBIN0000456', status: 'Active' },
        { vendorCode: 'VEN031', account: 'Meera Farm Supplies 30', groupName: 'Sundry Creditors', creditDays: 60, gstNo: '27AACFM7850K1ZS', panNo: 'AACFM7850K', opBalance: '₹17,000', address: 'Industrial Area, Kolhapur', bankAccountNo: '3214578001239', ifscCode: 'HDFC0001234', status: 'Active' },
        { vendorCode: 'VEN032', account: 'Meera Farm Supplies 31', groupName: 'Sundry Debtors', creditDays: 45, gstNo: '27AACFM7851K1ZS', panNo: 'AACFM7851K', opBalance: '₹18,200', address: 'Tilak Road, Pune', bankAccountNo: '3214578001240', ifscCode: 'ICIC001234', status: 'Inactive' },
        { vendorCode: 'VEN033', account: 'Meera Farm Supplies 32', groupName: 'Sundry Creditors', creditDays: 30, gstNo: '27AACFM7852K1ZS', panNo: 'AACFM7852K', opBalance: '₹19,500', address: 'College Road, Nashik', bankAccountNo: '3214578001241', ifscCode: 'SBIN0000456', status: 'Active' },
        { vendorCode: 'VEN034', account: 'Meera Farm Supplies 33', groupName: 'Sundry Debtors', creditDays: 60, gstNo: '27AACFM7853K1ZS', panNo: 'AACFM7853K', opBalance: '₹20,000', address: 'Ring Road, Solapur', bankAccountNo: '3214578001242', ifscCode: 'HDFC0001234', status: 'Active' },
        { vendorCode: 'VEN035', account: 'Meera Farm Supplies 34', groupName: 'Sundry Creditors', creditDays: 45, gstNo: '27AACFM7854K1ZS', panNo: 'AACFM7854K', opBalance: '₹21,400', address: 'Market Yard, Ahmednagar', bankAccountNo: '3214578001243', ifscCode: 'ICIC001234', status: 'Active' },
        { vendorCode: 'VEN036', account: 'Meera Farm Supplies 35', groupName: 'Sundry Debtors', creditDays: 30, gstNo: '27AACFM7855K1ZS', panNo: 'AACFM7855K', opBalance: '₹22,300', address: 'APMC Market, Karad', bankAccountNo: '3214578001244', ifscCode: 'SBIN0000456', status: 'Active' },
        { vendorCode: 'VEN037', account: 'Meera Farm Supplies 36', groupName: 'Sundry Creditors', creditDays: 60, gstNo: '27AACFM7856K1ZS', panNo: 'AACFM7856K', opBalance: '₹23,000', address: 'Bus Stand Road, Miraj', bankAccountNo: '3214578001245', ifscCode: 'HDFC0001234', status: 'Active' },
        { vendorCode: 'VEN038', account: 'Meera Farm Supplies 37', groupName: 'Sundry Debtors', creditDays: 45, gstNo: '27AACFM7857K1ZS', panNo: 'AACFM7857K', opBalance: '₹24,600', address: 'Main Road, Ichalkaranji', bankAccountNo: '3214578001246', ifscCode: 'ICIC001234', status: 'Active' },
        { vendorCode: 'VEN039', account: 'Meera Farm Supplies 38', groupName: 'Sundry Creditors', creditDays: 30, gstNo: '27AACFM7858K1ZS', panNo: 'AACFM7858K', opBalance: '₹25,000', address: 'Laxmi Road, Pune', bankAccountNo: '3214578001247', ifscCode: 'SBIN0000456', status: 'Inactive' },
        { vendorCode: 'VEN040', account: 'Meera Farm Supplies 39', groupName: 'Sundry Debtors', creditDays: 60, gstNo: '27AACFM7859K1ZS', panNo: 'AACFM7859K', opBalance: '₹26,700', address: 'Market Area, Kolhapur', bankAccountNo: '3214578001248', ifscCode: 'HDFC0001234', status: 'Active' },
        { vendorCode: 'VEN041', account: 'Meera Farm Supplies 40', groupName: 'Sundry Creditors', creditDays: 45, gstNo: '27AACFM7860K1ZS', panNo: 'AACFM7860K', opBalance: '₹27,200', address: 'Station Chowk, Sangli', bankAccountNo: '3214578001249', ifscCode: 'ICIC001234', status: 'Active' },
        { vendorCode: 'VEN042', account: 'Meera Farm Supplies 41', groupName: 'Sundry Debtors', creditDays: 30, gstNo: '27AACFM7861K1ZS', panNo: 'AACFM7861K', opBalance: '₹28,100', address: 'Shivaji Road, Satara', bankAccountNo: '3214578001250', ifscCode: 'SBIN0000456', status: 'Active' },
        { vendorCode: 'VEN043', account: 'Meera Farm Supplies 42', groupName: 'Sundry Creditors', creditDays: 60, gstNo: '27AACFM7862K1ZS', panNo: 'AACFM7862K', opBalance: '₹29,500', address: 'Old Market, Kolhapur', bankAccountNo: '3214578001251', ifscCode: 'HDFC0001234', status: 'Active' },
        { vendorCode: 'VEN044', account: 'Meera Farm Supplies 43', groupName: 'Sundry Debtors', creditDays: 45, gstNo: '27AACFM7863K1ZS', panNo: 'AACFM7863K', opBalance: '₹30,000', address: 'College Chowk, Pune', bankAccountNo: '3214578001252', ifscCode: 'ICIC001234', status: 'Active' },
        { vendorCode: 'VEN045', account: 'Meera Farm Supplies 44', groupName: 'Sundry Creditors', creditDays: 30, gstNo: '27AACFM7864K1ZS', panNo: 'AACFM7864K', opBalance: '₹31,400', address: 'Market Lane, Nashik', bankAccountNo: '3214578001253', ifscCode: 'SBIN0000456', status: 'Active' },
        { vendorCode: 'VEN046', account: 'Meera Farm Supplies 45', groupName: 'Sundry Debtors', creditDays: 60, gstNo: '27AACFM7865K1ZS', panNo: 'AACFM7865K', opBalance: '₹32,100', address: 'APMC Yard, Sangli', bankAccountNo: '3214578001254', ifscCode: 'HDFC0001234', status: 'Active' },
        { vendorCode: 'VEN047', account: 'Meera Farm Supplies 46', groupName: 'Sundry Creditors', creditDays: 45, gstNo: '27AACFM7866K1ZS', panNo: 'AACFM7866K', opBalance: '₹33,000', address: 'Market Street, Kolhapur', bankAccountNo: '3214578001255', ifscCode: 'ICIC001234', status: 'Active' },
        { vendorCode: 'VEN048', account: 'Meera Farm Supplies 47', groupName: 'Sundry Debtors', creditDays: 30, gstNo: '27AACFM7867K1ZS', panNo: 'AACFM7867K', opBalance: '₹34,800', address: 'Station Area, Pune', bankAccountNo: '3214578001256', ifscCode: 'SBIN0000456', status: 'Active' },
        { vendorCode: 'VEN049', account: 'Meera Farm Supplies 48', groupName: 'Sundry Creditors', creditDays: 60, gstNo: '27AACFM7868K1ZS', panNo: 'AACFM7868K', opBalance: '₹35,600', address: 'Main Chowk, Satara', bankAccountNo: '3214578001257', ifscCode: 'HDFC0001234', status: 'Active' },
        { vendorCode: 'VEN050', account: 'Meera Farm Supplies 49', groupName: 'Sundry Debtors', creditDays: 45, gstNo: '27AACFM7869K1ZS', panNo: 'AACFM7869K', opBalance: '₹36,200', address: 'College Road, Nashik', bankAccountNo: '3214578001258', ifscCode: 'ICIC001234', status: 'Active' },
        { vendorCode: 'VEN051', account: 'Meera Farm Supplies 50', groupName: 'Sundry Creditors', creditDays: 30, gstNo: '27AACFM7870K1ZS', panNo: 'AACFM7870K', opBalance: '₹37,500', address: 'Ring Road, Solapur', bankAccountNo: '3214578001259', ifscCode: 'SBIN0000456', status: 'Active' },
        { vendorCode: 'VEN052', account: 'Meera Farm Supplies 51', groupName: 'Sundry Debtors', creditDays: 60, gstNo: '27AACFM7871K1ZS', panNo: 'AACFM7871K', opBalance: '₹38,100', address: 'Market Yard, Ahmednagar', bankAccountNo: '3214578001260', ifscCode: 'HDFC0001234', status: 'Active' },
        { vendorCode: 'VEN053', account: 'Meera Farm Supplies 52', groupName: 'Sundry Creditors', creditDays: 45, gstNo: '27AACFM7872K1ZS', panNo: 'AACFM7872K', opBalance: '₹39,400', address: 'APMC Market, Karad', bankAccountNo: '3214578001261', ifscCode: 'ICIC001234', status: 'Active' },
        { vendorCode: 'VEN054', account: 'Meera Farm Supplies 53', groupName: 'Sundry Debtors', creditDays: 30, gstNo: '27AACFM7873K1ZS', panNo: 'AACFM7873K', opBalance: '₹40,000', address: 'Bus Stand Road, Miraj', bankAccountNo: '3214578001262', ifscCode: 'SBIN0000456', status: 'Active' },
        { vendorCode: 'VEN055', account: 'Meera Farm Supplies 54', groupName: 'Sundry Creditors', creditDays: 60, gstNo: '27AACFM7874K1ZS', panNo: 'AACFM7874K', opBalance: '₹41,200', address: 'Main Road, Ichalkaranji', bankAccountNo: '3214578001263', ifscCode: 'HDFC0001234', status: 'Active' },
        { vendorCode: 'VEN056', account: 'Meera Farm Supplies 55', groupName: 'Sundry Debtors', creditDays: 45, gstNo: '27AACFM7875K1ZS', panNo: 'AACFM7875K', opBalance: '₹42,500', address: 'Laxmi Road, Pune', bankAccountNo: '3214578001264', ifscCode: 'ICIC001234', status: 'Active' },
        { vendorCode: 'VEN057', account: 'Meera Farm Supplies 56', groupName: 'Sundry Creditors', creditDays: 30, gstNo: '27AACFM7876K1ZS', panNo: 'AACFM7876K', opBalance: '₹43,100', address: 'Market Area, Kolhapur', bankAccountNo: '3214578001265', ifscCode: 'SBIN0000456', status: 'Active' },
        { vendorCode: 'VEN058', account: 'Meera Farm Supplies 57', groupName: 'Sundry Debtors', creditDays: 60, gstNo: '27AACFM7877K1ZS', panNo: 'AACFM7877K', opBalance: '₹44,600', address: 'Station Chowk, Sangli', bankAccountNo: '3214578001266', ifscCode: 'HDFC0001234', status: 'Active' },
        { vendorCode: 'VEN059', account: 'Meera Farm Supplies 58', groupName: 'Sundry Creditors', creditDays: 45, gstNo: '27AACFM7878K1ZS', panNo: 'AACFM7878K', opBalance: '₹45,200', address: 'Shivaji Road, Satara', bankAccountNo: '3214578001267', ifscCode: 'ICIC001234', status: 'Active' },
        { vendorCode: 'VEN060', account: 'Meera Farm Supplies 59', groupName: 'Sundry Debtors', creditDays: 30, gstNo: '27AACFM7879K1ZS', panNo: 'AACFM7879K', opBalance: '₹46,700', address: 'Old Market, Kolhapur', bankAccountNo: '3214578001268' , ifscCode: 'ICIC001234', status: 'Inactive' },
        { vendorCode: 'VEN061', account: 'Meera Farm Supplies 60', groupName: 'Sundry Debtors', creditDays: 45, gstNo: '27AACFM7851K1ZS', panNo: 'AACFM7851K', opBalance: '₹18,200', address: 'Tilak Road, Pune', bankAccountNo: '3214578001240', ifscCode: 'ICIC001234', status: 'Inactive' },
        { vendorCode: 'VEN062', account: 'Meera Farm Supplies 61', groupName: 'Sundry Creditors', creditDays: 30, gstNo: '27AACFM7852K1ZS', panNo: 'AACFM7852K', opBalance: '₹19,500', address: 'College Road, Nashik', bankAccountNo: '3214578001241', ifscCode: 'SBIN0000456', status: 'Active' },
        { vendorCode: 'VEN063', account: 'Meera Farm Supplies 62', groupName: 'Sundry Debtors', creditDays: 60, gstNo: '27AACFM7853K1ZS', panNo: 'AACFM7853K', opBalance: '₹20,000', address: 'Ring Road, Solapur', bankAccountNo: '3214578001242', ifscCode: 'HDFC0001234', status: 'Active' },
        { vendorCode: 'VEN064', account: 'Meera Farm Supplies 63', groupName: 'Sundry Creditors', creditDays: 45, gstNo: '27AACFM7854K1ZS', panNo: 'AACFM7854K', opBalance: '₹21,400', address: 'Market Yard, Ahmednagar', bankAccountNo: '3214578001243', ifscCode: 'ICIC001234', status: 'Active' },
        { vendorCode: 'VEN065', account: 'Meera Farm Supplies 64', groupName: 'Sundry Debtors', creditDays: 30, gstNo: '27AACFM7855K1ZS', panNo: 'AACFM7855K', opBalance: '₹22,300', address: 'APMC Market, Karad', bankAccountNo: '3214578001244', ifscCode: 'SBIN0000456', status: 'Active' },
        { vendorCode: 'VEN066', account: 'Meera Farm Supplies 65', groupName: 'Sundry Creditors', creditDays: 60, gstNo: '27AACFM7856K1ZS', panNo: 'AACFM7856K', opBalance: '₹23,000', address: 'Bus Stand Road, Miraj', bankAccountNo: '3214578001245', ifscCode: 'HDFC0001234', status: 'Active' },
        { vendorCode: 'VEN067', account: 'Meera Farm Supplies 66', groupName: 'Sundry Debtors', creditDays: 45, gstNo: '27AACFM7857K1ZS', panNo: 'AACFM7857K', opBalance: '₹24,600', address: 'Main Road, Ichalkaranji', bankAccountNo: '3214578001246', ifscCode: 'ICIC001234', status: 'Active' },
        { vendorCode: 'VEN068', account: 'Meera Farm Supplies 67', groupName: 'Sundry Creditors', creditDays: 30, gstNo: '27AACFM7858K1ZS', panNo: 'AACFM7858K', opBalance: '₹25,000', address: 'Laxmi Road, Pune', bankAccountNo: '3214578001247', ifscCode: 'SBIN0000456', status: 'Inactive' },
        { vendorCode: 'VEN069', account: 'Meera Farm Supplies 68', groupName: 'Sundry Debtors', creditDays: 60, gstNo: '27AACFM7859K1ZS', panNo: 'AACFM7859K', opBalance: '₹26,700', address: 'Market Area, Kolhapur', bankAccountNo: '3214578001248', ifscCode: 'HDFC0001234', status: 'Active' },
        { vendorCode: 'VEN070', account: 'Meera Farm Supplies 69', groupName: 'Sundry Creditors', creditDays: 45, gstNo: '27AACFM7860K1ZS', panNo: 'AACFM7860K', opBalance: '₹27,200', address: 'Station Chowk, Sangli', bankAccountNo: '3214578001249', ifscCode: 'ICIC001234', status: 'Active' },
        { vendorCode: 'VEN071', account: 'Meera Farm Supplies 70', groupName: 'Sundry Debtors', creditDays: 30, gstNo: '27AACFM7861K1ZS', panNo: 'AACFM7861K', opBalance: '₹28,100', address: 'Shivaji Road, Satara', bankAccountNo: '3214578001250', ifscCode: 'SBIN0000456', status: 'Active' },
        { vendorCode: 'VEN072', account: 'Meera Farm Supplies 71', groupName: 'Sundry Creditors', creditDays: 60, gstNo: '27AACFM7862K1ZS', panNo: 'AACFM7862K', opBalance: '₹29,500', address: 'Old Market, Kolhapur', bankAccountNo: '3214578001251', ifscCode: 'HDFC0001234', status: 'Active' },
        { vendorCode: 'VEN073', account: 'Meera Farm Supplies 72', groupName: 'Sundry Debtors', creditDays: 45, gstNo: '27AACFM7863K1ZS', panNo: 'AACFM7863K', opBalance: '₹30,000', address: 'College Chowk, Pune', bankAccountNo: '3214578001252', ifscCode: 'ICIC001234', status: 'Active' },
        { vendorCode: 'VEN074', account: 'Meera Farm Supplies 73', groupName: 'Sundry Creditors', creditDays: 30, gstNo: '27AACFM7864K1ZS', panNo: 'AACFM7864K', opBalance: '₹31,400', address: 'Market Lane, Nashik', bankAccountNo: '3214578001253', ifscCode: 'SBIN0000456', status: 'Active' },
        { vendorCode: 'VEN075', account: 'Meera Farm Supplies 74', groupName: 'Sundry Debtors', creditDays: 60, gstNo: '27AACFM7865K1ZS', panNo: 'AACFM7865K', opBalance: '₹32,100', address: 'APMC Yard, Sangli', bankAccountNo: '3214578001254', ifscCode: 'HDFC0001234', status: 'Active' },
        { vendorCode: 'VEN076', account: 'Meera Farm Supplies 75', groupName: 'Sundry Creditors', creditDays: 45, gstNo: '27AACFM7866K1ZS', panNo: 'AACFM7866K', opBalance: '₹33,000', address: 'Market Street, Kolhapur', bankAccountNo: '3214578001255', ifscCode: 'ICIC001234', status: 'Active' },
        { vendorCode: 'VEN077', account: 'Meera Farm Supplies 76', groupName: 'Sundry Debtors', creditDays: 30, gstNo: '27AACFM7867K1ZS', panNo: 'AACFM7867K', opBalance: '₹34,800', address: 'Station Area, Pune', bankAccountNo: '3214578001256', ifscCode: 'SBIN0000456', status: 'Active' },
        { vendorCode: 'VEN078', account: 'Meera Farm Supplies 77', groupName: 'Sundry Creditors', creditDays: 60, gstNo: '27AACFM7868K1ZS', panNo: 'AACFM7868K', opBalance: '₹35,600', address: 'Main Chowk, Satara', bankAccountNo: '3214578001257', ifscCode: 'HDFC0001234', status: 'Active' },
        { vendorCode: 'VEN079', account: 'Meera Farm Supplies 78', groupName: 'Sundry Debtors', creditDays: 45, gstNo: '27AACFM7845K1ZS', panNo: 'AACFM7845K', opBalance: '₹12,500', address: 'Shanti Nagar Colony, Kolhapur', bankAccountNo: '3214578001234', ifscCode: 'ICIC001234', status: 'Active' },
        { vendorCode: 'VEN080', account: 'Meera Farm Supplies 79', groupName: 'Sundry Creditors', creditDays: 30, gstNo: '27AACFM7846K1ZS', panNo: 'AACFM7846K', opBalance: '₹13,000', address: 'Market Road, Nashik', bankAccountNo: '3214578001235', ifscCode: 'SBIN0000456', status: 'Active' },
        { vendorCode: 'VEN081', account: 'Meera Farm Supplies 80', groupName: 'Sundry Debtors', creditDays: 60, gstNo: '27AACFM7847K1ZS', panNo: 'AACFM7847K', opBalance: '₹14,200', address: 'Station Road, Pune', bankAccountNo: '3214578001236', ifscCode: 'HDFC0001234', status: 'Active' },
        { vendorCode: 'VEN082', account: 'Meera Farm Supplies 81', groupName: 'Sundry Creditors', creditDays: 45, gstNo: '27AACFM7848K1ZS', panNo: 'AACFM7848K', opBalance: '₹15,100', address: 'Main Bazaar, Satara', bankAccountNo: '3214578001237', ifscCode: 'ICIC001234', status: 'Active' },
        { vendorCode: 'VEN083', account: 'Meera Farm Supplies 82', groupName: 'Sundry Debtors', creditDays: 30, gstNo: '27AACFM7849K1ZS', panNo: 'AACFM7849K', opBalance: '₹16,300', address: 'MG Road, Sangli', bankAccountNo: '3214578001238', ifscCode: 'SBIN0000456', status: 'Active' },
        { vendorCode: 'VEN084', account: 'Meera Farm Supplies 83', groupName: 'Sundry Creditors', creditDays: 60, gstNo: '27AACFM7850K1ZS', panNo: 'AACFM7850K', opBalance: '₹17,000', address: 'Industrial Area, Kolhapur', bankAccountNo: '3214578001239', ifscCode: 'HDFC0001234', status: 'Active' },
        { vendorCode: 'VEN085', account: 'Meera Farm Supplies 84', groupName: 'Sundry Debtors', creditDays: 45, gstNo: '27AACFM7851K1ZS', panNo: 'AACFM7851K', opBalance: '₹18,200', address: 'Tilak Road, Pune', bankAccountNo: '3214578001240', ifscCode: 'ICIC001234', status: 'Inactive' },
        { vendorCode: 'VEN086', account: 'Meera Farm Supplies 85', groupName: 'Sundry Creditors', creditDays: 30, gstNo: '27AACFM7852K1ZS', panNo: 'AACFM7852K', opBalance: '₹19,500', address: 'College Road, Nashik', bankAccountNo: '3214578001241', ifscCode: 'SBIN0000456', status: 'Active' },
        { vendorCode: 'VEN087', account: 'Meera Farm Supplies 86', groupName: 'Sundry Debtors', creditDays: 60, gstNo: '27AACFM7853K1ZS', panNo: 'AACFM7853K', opBalance: '₹20,000', address: 'Ring Road, Solapur', bankAccountNo: '3214578001242', ifscCode: 'HDFC0001234', status: 'Active' },
        { vendorCode: 'VEN088', account: 'Meera Farm Supplies 87', groupName: 'Sundry Creditors', creditDays: 45, gstNo: '27AACFM7854K1ZS', panNo: 'AACFM7854K', opBalance: '₹21,400', address: 'Market Yard, Ahmednagar', bankAccountNo: '3214578001243', ifscCode: 'ICIC001234', status: 'Active' },
        { vendorCode: 'VEN089', account: 'Meera Farm Supplies 88', groupName: 'Sundry Debtors', creditDays: 30, gstNo: '27AACFM7855K1ZS', panNo: 'AACFM7855K', opBalance: '₹22,300', address: 'APMC Market, Karad', bankAccountNo: '3214578001244', ifscCode: 'SBIN0000456', status: 'Active' },
        { vendorCode: 'VEN090', account: 'Meera Farm Supplies 89', groupName: 'Sundry Creditors', creditDays: 60, gstNo: '27AACFM7856K1ZS', panNo: 'AACFM7856K', opBalance: '₹23,000', address: 'Bus Stand Road, Miraj', bankAccountNo: '3214578001245', ifscCode: 'HDFC0001234', status: 'Active' },
        { vendorCode: 'VEN091', account: 'Meera Farm Supplies 90', groupName: 'Sundry Debtors', creditDays: 45, gstNo: '27AACFM7857K1ZS', panNo: 'AACFM7857K', opBalance: '₹24,600', address: 'Main Road, Ichalkaranji', bankAccountNo: '3214578001246', ifscCode: 'ICIC001234', status: 'Active' },
        { vendorCode: 'VEN092', account: 'Meera Farm Supplies 91', groupName: 'Sundry Creditors', creditDays: 30, gstNo: '27AACFM7858K1ZS', panNo: 'AACFM7858K', opBalance: '₹25,000', address: 'Laxmi Road, Pune', bankAccountNo: '3214578001247', ifscCode: 'SBIN0000456', status: 'Inactive' },
        { vendorCode: 'VEN093', account: 'Meera Farm Supplies 92', groupName: 'Sundry Debtors', creditDays: 60, gstNo: '27AACFM7859K1ZS', panNo: 'AACFM7859K', opBalance: '₹26,700', address: 'Market Area, Kolhapur', bankAccountNo: '3214578001248', ifscCode: 'HDFC0001234', status: 'Active' },
        { vendorCode: 'VEN094', account: 'Meera Farm Supplies 93', groupName: 'Sundry Creditors', creditDays: 45, gstNo: '27AACFM7860K1ZS', panNo: 'AACFM7860K', opBalance: '₹27,200', address: 'Station Chowk, Sangli', bankAccountNo: '3214578001249', ifscCode: 'ICIC001234', status: 'Active' },
        { vendorCode: 'VEN095', account: 'Meera Farm Supplies 94', groupName: 'Sundry Debtors', creditDays: 30, gstNo: '27AACFM7861K1ZS', panNo: 'AACFM7861K', opBalance: '₹28,100', address: 'Shivaji Road, Satara', bankAccountNo: '3214578001250', ifscCode: 'SBIN0000456', status: 'Active' },
        { vendorCode: 'VEN096', account: 'Meera Farm Supplies 95', groupName: 'Sundry Creditors', creditDays: 60, gstNo: '27AACFM7862K1ZS', panNo: 'AACFM7862K', opBalance: '₹29,500', address: 'Old Market, Kolhapur', bankAccountNo: '3214578001251', ifscCode: 'HDFC0001234', status: 'Active' },
        { vendorCode: 'VEN097', account: 'Meera Farm Supplies 96', groupName: 'Sundry Debtors', creditDays: 45, gstNo: '27AACFM7863K1ZS', panNo: 'AACFM7863K', opBalance: '₹30,000', address: 'College Chowk, Pune', bankAccountNo: '3214578001252', ifscCode: 'ICIC001234', status: 'Active' },
        { vendorCode: 'VEN098', account: 'Meera Farm Supplies 97', groupName: 'Sundry Creditors', creditDays: 30, gstNo: '27AACFM7864K1ZS', panNo: 'AACFM7864K', opBalance: '₹31,400', address: 'Market Lane, Nashik', bankAccountNo: '3214578001253', ifscCode: 'SBIN0000456', status: 'Active' },
        { vendorCode: 'VEN099', account: 'Meera Farm Supplies 98', groupName: 'Sundry Debtors', creditDays: 60, gstNo: '27AACFM7865K1ZS', panNo: 'AACFM7865K', opBalance: '₹32,100', address: 'APMC Yard, Sangli', bankAccountNo: '3214578001254', ifscCode: 'HDFC0001234', status: 'Active' },
        { vendorCode: 'VEN100', account: 'Meera Farm Supplies 99', groupName: 'Sundry Creditors', creditDays: 45, gstNo: '27AACFM7866K1ZS', panNo: 'AACFM7866K', opBalance: '₹33,000', address: 'Market Street, Kolhapur', bankAccountNo: '3214578001255', ifscCode: 'ICIC001234', status: 'Active' },
        { vendorCode: 'VEN101', account: 'Meera Farm Supplies 100', groupName: 'Sundry Debtors', creditDays: 30, gstNo: '27AACFM7867K1ZS', panNo: 'AACFM7867K', opBalance: '₹34,800', address: 'Station Area, Pune', bankAccountNo: '3214578001256', ifscCode: 'SBIN0000456', status: 'Active' },
        { vendorCode: 'VEN102', account: 'Meera Farm Supplies 101', groupName: 'Sundry Creditors', creditDays: 60, gstNo: '27AACFM7868K1ZS', panNo: 'AACFM7868K', opBalance: '₹35,600', address: 'Main Chowk, Satara', bankAccountNo: '3214578001257', ifscCode: 'HDFC0001234', status: 'Active' },
        { vendorCode: 'VEN103', account: 'Meera Farm Supplies 102', groupName: 'Sundry Debtors', creditDays: 45, gstNo: '27AACFM7845K1ZS', panNo: 'AACFM7845K', opBalance: '₹12,500', address: 'Shanti Nagar Colony, Kolhapur', bankAccountNo: '3214578001234', ifscCode: 'ICIC001234', status: 'Active' },
        { vendorCode: 'VEN104', account: 'Meera Farm Supplies 103', groupName: 'Sundry Creditors', creditDays: 30, gstNo: '27AACFM7846K1ZS', panNo: 'AACFM7846K', opBalance: '₹13,000', address: 'Market Road, Nashik', bankAccountNo: '3214578001235', ifscCode: 'SBIN0000456', status: 'Active' },
        { vendorCode: 'VEN105', account: 'Meera Farm Supplies 104', groupName: 'Sundry Debtors', creditDays: 60, gstNo: '27AACFM7847K1ZS', panNo: 'AACFM7847K', opBalance: '₹14,200', address: 'Station Road, Pune', bankAccountNo: '3214578001236', ifscCode: 'HDFC0001234', status: 'Active' },
        { vendorCode: 'VEN106', account: 'Meera Farm Supplies 105', groupName: 'Sundry Creditors', creditDays: 45, gstNo: '27AACFM7848K1ZS', panNo: 'AACFM7848K', opBalance: '₹15,100', address: 'Main Bazaar, Satara', bankAccountNo: '3214578001237', ifscCode: 'ICIC001234', status: 'Active' },
        { vendorCode: 'VEN107', account: 'Meera Farm Supplies 106', groupName: 'Sundry Debtors', creditDays: 30, gstNo: '27AACFM7849K1ZS', panNo: 'AACFM7849K', opBalance: '₹16,300', address: 'MG Road, Sangli', bankAccountNo: '3214578001238', ifscCode: 'SBIN0000456', status: 'Active' },
        { vendorCode: 'VEN108', account: 'Meera Farm Supplies 107', groupName: 'Sundry Creditors', creditDays: 60, gstNo: '27AACFM7850K1ZS', panNo: 'AACFM7850K', opBalance: '₹17,000', address: 'Industrial Area, Kolhapur', bankAccountNo: '3214578001239', ifscCode: 'HDFC0001234', status: 'Active' },
        { vendorCode: 'VEN008', account: 'Meera Farm Supplies 7', groupName: 'Sundry Debtors', creditDays: 45, gstNo: '27AACFM7851K1ZS', panNo: 'AACFM7851K', opBalance: '₹18,200', address: 'Tilak Road, Pune', bankAccountNo: '3214578001240', ifscCode: 'ICIC001234', status: 'Inactive' },
        { vendorCode: 'VEN009', account: 'Meera Farm Supplies 8', groupName: 'Sundry Creditors', creditDays: 30, gstNo: '27AACFM7852K1ZS', panNo: 'AACFM7852K', opBalance: '₹19,500', address: 'College Road, Nashik', bankAccountNo: '3214578001241', ifscCode: 'SBIN0000456', status: 'Active' },
        { vendorCode: 'VEN010', account: 'Meera Farm Supplies 9', groupName: 'Sundry Debtors', creditDays: 60, gstNo: '27AACFM7853K1ZS', panNo: 'AACFM7853K', opBalance: '₹20,000', address: 'Ring Road, Solapur', bankAccountNo: '3214578001242', ifscCode: 'HDFC0001234', status: 'Active' },
        { vendorCode: 'VEN011', account: 'Meera Farm Supplies 10', groupName: 'Sundry Creditors', creditDays: 45, gstNo: '27AACFM7854K1ZS', panNo: 'AACFM7854K', opBalance: '₹21,400', address: 'Market Yard, Ahmednagar', bankAccountNo: '3214578001243', ifscCode: 'ICIC001234', status: 'Active' },
        { vendorCode: 'VEN012', account: 'Meera Farm Supplies 11', groupName: 'Sundry Debtors', creditDays: 30, gstNo: '27AACFM7855K1ZS', panNo: 'AACFM7855K', opBalance: '₹22,300', address: 'APMC Market, Karad', bankAccountNo: '3214578001244', ifscCode: 'SBIN0000456', status: 'Active' },
        { vendorCode: 'VEN013', account: 'Meera Farm Supplies 12', groupName: 'Sundry Creditors', creditDays: 60, gstNo: '27AACFM7856K1ZS', panNo: 'AACFM7856K', opBalance: '₹23,000', address: 'Bus Stand Road, Miraj', bankAccountNo: '3214578001245', ifscCode: 'HDFC0001234', status: 'Active' },
        { vendorCode: 'VEN014', account: 'Meera Farm Supplies 13', groupName: 'Sundry Debtors', creditDays: 45, gstNo: '27AACFM7857K1ZS', panNo: 'AACFM7857K', opBalance: '₹24,600', address: 'Main Road, Ichalkaranji', bankAccountNo: '3214578001246', ifscCode: 'ICIC001234', status: 'Active' },
        { vendorCode: 'VEN015', account: 'Meera Farm Supplies 14', groupName: 'Sundry Creditors', creditDays: 30, gstNo: '27AACFM7858K1ZS', panNo: 'AACFM7858K', opBalance: '₹25,000', address: 'Laxmi Road, Pune', bankAccountNo: '3214578001247', ifscCode: 'SBIN0000456', status: 'Inactive' },
        { vendorCode: 'VEN016', account: 'Meera Farm Supplies 15', groupName: 'Sundry Debtors', creditDays: 60, gstNo: '27AACFM7859K1ZS', panNo: 'AACFM7859K', opBalance: '₹26,700', address: 'Market Area, Kolhapur', bankAccountNo: '3214578001248', ifscCode: 'HDFC0001234', status: 'Active' },
        { vendorCode: 'VEN017', account: 'Meera Farm Supplies 16', groupName: 'Sundry Creditors', creditDays: 45, gstNo: '27AACFM7860K1ZS', panNo: 'AACFM7860K', opBalance: '₹27,200', address: 'Station Chowk, Sangli', bankAccountNo: '3214578001249', ifscCode: 'ICIC001234', status: 'Active' },
        { vendorCode: 'VEN018', account: 'Meera Farm Supplies 17', groupName: 'Sundry Debtors', creditDays: 30, gstNo: '27AACFM7861K1ZS', panNo: 'AACFM7861K', opBalance: '₹28,100', address: 'Shivaji Road, Satara', bankAccountNo: '3214578001250', ifscCode: 'SBIN0000456', status: 'Active' },
        { vendorCode: 'VEN019', account: 'Meera Farm Supplies 18', groupName: 'Sundry Creditors', creditDays: 60, gstNo: '27AACFM7862K1ZS', panNo: 'AACFM7862K', opBalance: '₹29,500', address: 'Old Market, Kolhapur', bankAccountNo: '3214578001251', ifscCode: 'HDFC0001234', status: 'Active' },
        { vendorCode: 'VEN020', account: 'Meera Farm Supplies 19', groupName: 'Sundry Debtors', creditDays: 45, gstNo: '27AACFM7863K1ZS', panNo: 'AACFM7863K', opBalance: '₹30,000', address: 'College Chowk, Pune', bankAccountNo: '3214578001252', ifscCode: 'ICIC001234', status: 'Active' },
        { vendorCode: 'VEN021', account: 'Meera Farm Supplies 20', groupName: 'Sundry Creditors', creditDays: 30, gstNo: '27AACFM7864K1ZS', panNo: 'AACFM7864K', opBalance: '₹31,400', address: 'Market Lane, Nashik', bankAccountNo: '3214578001253', ifscCode: 'SBIN0000456', status: 'Active' },
        { vendorCode: 'VEN022', account: 'Meera Farm Supplies 21', groupName: 'Sundry Debtors', creditDays: 60, gstNo: '27AACFM7865K1ZS', panNo: 'AACFM7865K', opBalance: '₹32,100', address: 'APMC Yard, Sangli', bankAccountNo: '3214578001254', ifscCode: 'HDFC0001234', status: 'Active' },
        { vendorCode: 'VEN023', account: 'Meera Farm Supplies 22', groupName: 'Sundry Creditors', creditDays: 45, gstNo: '27AACFM7866K1ZS', panNo: 'AACFM7866K', opBalance: '₹33,000', address: 'Market Street, Kolhapur', bankAccountNo: '3214578001255', ifscCode: 'ICIC001234', status: 'Active' },
        { vendorCode: 'VEN024', account: 'Meera Farm Supplies 23', groupName: 'Sundry Debtors', creditDays: 30, gstNo: '27AACFM7867K1ZS', panNo: 'AACFM7867K', opBalance: '₹34,800', address: 'Station Area, Pune', bankAccountNo: '3214578001256', ifscCode: 'SBIN0000456', status: 'Active' },
        { vendorCode: 'VEN025', account: 'Meera Farm Supplies 24', groupName: 'Sundry Creditors', creditDays: 60, gstNo: '27AACFM7868K1ZS', panNo: 'AACFM7868K', opBalance: '₹35,600', address: 'Main Chowk, Satara', bankAccountNo: '3214578001257', ifscCode: 'HDFC0001234', status: 'Active' },
        { vendorCode: 'VEN002', account: 'Meera Farm Supplies 1', groupName: 'Sundry Debtors', creditDays: 45, gstNo: '27AACFM7845K1ZS', panNo: 'AACFM7845K', opBalance: '₹12,500', address: 'Shanti Nagar Colony, Kolhapur', bankAccountNo: '3214578001234', ifscCode: 'ICIC001234', status: 'Active' },
        { vendorCode: 'VEN003', account: 'Meera Farm Supplies 2', groupName: 'Sundry Creditors', creditDays: 30, gstNo: '27AACFM7846K1ZS', panNo: 'AACFM7846K', opBalance: '₹13,000', address: 'Market Road, Nashik', bankAccountNo: '3214578001235', ifscCode: 'SBIN0000456', status: 'Active' },
        { vendorCode: 'VEN004', account: 'Meera Farm Supplies 3', groupName: 'Sundry Debtors', creditDays: 60, gstNo: '27AACFM7847K1ZS', panNo: 'AACFM7847K', opBalance: '₹14,200', address: 'Station Road, Pune', bankAccountNo: '3214578001236', ifscCode: 'HDFC0001234', status: 'Active' },
        { vendorCode: 'VEN005', account: 'Meera Farm Supplies 4', groupName: 'Sundry Creditors', creditDays: 45, gstNo: '27AACFM7848K1ZS', panNo: 'AACFM7848K', opBalance: '₹15,100', address: 'Main Bazaar, Satara', bankAccountNo: '3214578001237', ifscCode: 'ICIC001234', status: 'Active' },
        { vendorCode: 'VEN006', account: 'Meera Farm Supplies 5', groupName: 'Sundry Debtors', creditDays: 30, gstNo: '27AACFM7849K1ZS', panNo: 'AACFM7849K', opBalance: '₹16,300', address: 'MG Road, Sangli', bankAccountNo: '3214578001238', ifscCode: 'SBIN0000456', status: 'Active' },
        { vendorCode: 'VEN007', account: 'Meera Farm Supplies 6', groupName: 'Sundry Creditors', creditDays: 60, gstNo: '27AACFM7850K1ZS', panNo: 'AACFM7850K', opBalance: '₹17,000', address: 'Industrial Area, Kolhapur', bankAccountNo: '3214578001239', ifscCode: 'HDFC0001234', status: 'Active' },
        { vendorCode: 'VEN008', account: 'Meera Farm Supplies 7', groupName: 'Sundry Debtors', creditDays: 45, gstNo: '27AACFM7851K1ZS', panNo: 'AACFM7851K', opBalance: '₹18,200', address: 'Tilak Road, Pune', bankAccountNo: '3214578001240', ifscCode: 'ICIC001234', status: 'Inactive' },
        { vendorCode: 'VEN009', account: 'Meera Farm Supplies 8', groupName: 'Sundry Creditors', creditDays: 30, gstNo: '27AACFM7852K1ZS', panNo: 'AACFM7852K', opBalance: '₹19,500', address: 'College Road, Nashik', bankAccountNo: '3214578001241', ifscCode: 'SBIN0000456', status: 'Active' },
        { vendorCode: 'VEN010', account: 'Meera Farm Supplies 9', groupName: 'Sundry Debtors', creditDays: 60, gstNo: '27AACFM7853K1ZS', panNo: 'AACFM7853K', opBalance: '₹20,000', address: 'Ring Road, Solapur', bankAccountNo: '3214578001242', ifscCode: 'HDFC0001234', status: 'Active' },
        { vendorCode: 'VEN011', account: 'Meera Farm Supplies 10', groupName: 'Sundry Creditors', creditDays: 45, gstNo: '27AACFM7854K1ZS', panNo: 'AACFM7854K', opBalance: '₹21,400', address: 'Market Yard, Ahmednagar', bankAccountNo: '3214578001243', ifscCode: 'ICIC001234', status: 'Active' },
        { vendorCode: 'VEN012', account: 'Meera Farm Supplies 11', groupName: 'Sundry Debtors', creditDays: 30, gstNo: '27AACFM7855K1ZS', panNo: 'AACFM7855K', opBalance: '₹22,300', address: 'APMC Market, Karad', bankAccountNo: '3214578001244', ifscCode: 'SBIN0000456', status: 'Active' },
        { vendorCode: 'VEN013', account: 'Meera Farm Supplies 12', groupName: 'Sundry Creditors', creditDays: 60, gstNo: '27AACFM7856K1ZS', panNo: 'AACFM7856K', opBalance: '₹23,000', address: 'Bus Stand Road, Miraj', bankAccountNo: '3214578001245', ifscCode: 'HDFC0001234', status: 'Active' },
        { vendorCode: 'VEN014', account: 'Meera Farm Supplies 13', groupName: 'Sundry Debtors', creditDays: 45, gstNo: '27AACFM7857K1ZS', panNo: 'AACFM7857K', opBalance: '₹24,600', address: 'Main Road, Ichalkaranji', bankAccountNo: '3214578001246', ifscCode: 'ICIC001234', status: 'Active' },
        { vendorCode: 'VEN015', account: 'Meera Farm Supplies 14', groupName: 'Sundry Creditors', creditDays: 30, gstNo: '27AACFM7858K1ZS', panNo: 'AACFM7858K', opBalance: '₹25,000', address: 'Laxmi Road, Pune', bankAccountNo: '3214578001247', ifscCode: 'SBIN0000456', status: 'Inactive' },
        { vendorCode: 'VEN016', account: 'Meera Farm Supplies 15', groupName: 'Sundry Debtors', creditDays: 60, gstNo: '27AACFM7859K1ZS', panNo: 'AACFM7859K', opBalance: '₹26,700', address: 'Market Area, Kolhapur', bankAccountNo: '3214578001248', ifscCode: 'HDFC0001234', status: 'Active' },
        { vendorCode: 'VEN017', account: 'Meera Farm Supplies 16', groupName: 'Sundry Creditors', creditDays: 45, gstNo: '27AACFM7860K1ZS', panNo: 'AACFM7860K', opBalance: '₹27,200', address: 'Station Chowk, Sangli', bankAccountNo: '3214578001249', ifscCode: 'ICIC001234', status: 'Active' },
        { vendorCode: 'VEN018', account: 'Meera Farm Supplies 17', groupName: 'Sundry Debtors', creditDays: 30, gstNo: '27AACFM7861K1ZS', panNo: 'AACFM7861K', opBalance: '₹28,100', address: 'Shivaji Road, Satara', bankAccountNo: '3214578001250', ifscCode: 'SBIN0000456', status: 'Active' },
        { vendorCode: 'VEN019', account: 'Meera Farm Supplies 18', groupName: 'Sundry Creditors', creditDays: 60, gstNo: '27AACFM7862K1ZS', panNo: 'AACFM7862K', opBalance: '₹29,500', address: 'Old Market, Kolhapur', bankAccountNo: '3214578001251', ifscCode: 'HDFC0001234', status: 'Active' },
        { vendorCode: 'VEN020', account: 'Meera Farm Supplies 19', groupName: 'Sundry Debtors', creditDays: 45, gstNo: '27AACFM7863K1ZS', panNo: 'AACFM7863K', opBalance: '₹30,000', address: 'College Chowk, Pune', bankAccountNo: '3214578001252', ifscCode: 'ICIC001234', status: 'Active' },
        { vendorCode: 'VEN021', account: 'Meera Farm Supplies 20', groupName: 'Sundry Creditors', creditDays: 30, gstNo: '27AACFM7864K1ZS', panNo: 'AACFM7864K', opBalance: '₹31,400', address: 'Market Lane, Nashik', bankAccountNo: '3214578001253', ifscCode: 'SBIN0000456', status: 'Active' },
        { vendorCode: 'VEN022', account: 'Meera Farm Supplies 21', groupName: 'Sundry Debtors', creditDays: 60, gstNo: '27AACFM7865K1ZS', panNo: 'AACFM7865K', opBalance: '₹32,100', address: 'APMC Yard, Sangli', bankAccountNo: '3214578001254', ifscCode: 'HDFC0001234', status: 'Active' },
        { vendorCode: 'VEN023', account: 'Meera Farm Supplies 22', groupName: 'Sundry Creditors', creditDays: 45, gstNo: '27AACFM7866K1ZS', panNo: 'AACFM7866K', opBalance: '₹33,000', address: 'Market Street, Kolhapur', bankAccountNo: '3214578001255', ifscCode: 'ICIC001234', status: 'Active' },
        { vendorCode: 'VEN024', account: 'Meera Farm Supplies 23', groupName: 'Sundry Debtors', creditDays: 30, gstNo: '27AACFM7867K1ZS', panNo: 'AACFM7867K', opBalance: '₹34,800', address: 'Station Area, Pune', bankAccountNo: '3214578001256', ifscCode: 'SBIN0000456', status: 'Active' },
        { vendorCode: 'VEN025', account: 'Meera Farm Supplies 24', groupName: 'Sundry Creditors', creditDays: 60, gstNo: '27AACFM7868K1ZS', panNo: 'AACFM7868K', opBalance: '₹35,600', address: 'Main Chowk, Satara', bankAccountNo: '3214578001257', ifscCode: 'HDFC0001234', status: 'Active' }
    ]);

    const filteredData = tableData.filter(row => {
        let match = true;
        if (appliedFilters.gstNo && !row.gstNo.toLowerCase().includes(appliedFilters.gstNo.toLowerCase())) match = false;
        if (appliedFilters.panNo && !row.panNo.toLowerCase().includes(appliedFilters.panNo.toLowerCase())) match = false;
        if (appliedFilters.groupName && !row.groupName.toLowerCase().includes(appliedFilters.groupName.toLowerCase())) match = false;
        if (appliedFilters.creditDays && row.creditDays.toString() !== appliedFilters.creditDays) match = false;
        if (appliedFilters.status && row.status !== appliedFilters.status) match = false;

        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            const hasMatch = Object.values(row).some(val => 
                val !== null && val !== undefined && val.toString().toLowerCase().includes(query)
            );
            if (!hasMatch) match = false;
        }

        return match;
    });

    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, appliedFilters]);

    const totalItems = filteredData.length;
    const totalPages = Math.ceil(totalItems / rowsPerPage) || 1;
    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = Math.min(startIndex + rowsPerPage, totalItems);
    const paginatedData = filteredData.slice(startIndex, endIndex);

    const getVisiblePages = () => {
        let pages = [];
        if (totalPages <= 5) {
            for (let i = 1; i <= totalPages; i++) pages.push(i);
        } else {
            if (currentPage <= 3) {
                pages = [1, 2, 3, 4, 5];
            } else if (currentPage >= totalPages - 2) {
                pages = [totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
            } else {
                pages = [currentPage - 2, currentPage - 1, currentPage, currentPage + 1, currentPage + 2];
            }
        }
        return pages;
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setDropdownIndex(null);
            }
            if (exportRef.current && !exportRef.current.contains(event.target)) {
                setIsExportOpen(false);
            }
        };
        const handleEsc = (event) => {
            if (event.key === 'Escape') {
                setIsFilterOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('keydown', handleEsc);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleEsc);
        };
    }, []);

    const toggleDropdown = (index, event) => {
        event.stopPropagation();
        setDropdownIndex(dropdownIndex === index ? null : index);
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilterInputs(prev => ({ ...prev, [name]: value }));
    };

    const applyFilters = () => {
        setAppliedFilters(filterInputs);
        setIsFilterOpen(false);
    };

    const clearFilters = () => {
        const emptyFilters = {
            gstNo: '',
            panNo: '',
            groupName: '',
            creditDays: '',
            status: ''
        };
        setFilterInputs(emptyFilters);
        setAppliedFilters(emptyFilters);
    };

    const handleExportPDF = () => {
        const tableRows = filteredData.map((row, idx) => [
            idx + 1,
            row.vendorCode,
            row.account,
            row.groupName,
            row.creditDays,
            row.gstNo,
            row.panNo,
            row.opBalance,
            row.address,
            row.bankAccountNo,
            row.ifscCode,
            row.status
        ]);

        exportToPDF(
            'Account Master Report', 
            ['#', 'Vendor Code', 'Account', 'Group Name', 'Credit Days', 'GST.No', 'PAN.No', 'OP.Balance', 'Address', 'Bank A/C No', 'IFSC Code', 'Status'], 
            tableRows, 
            'account-master.pdf'
        );
        setIsExportOpen(false);
    };

    const handleExportExcel = () => {
        const data = filteredData.map((row, idx) => ({
            'S.No': idx + 1,
            'Vendor Code': row.vendorCode,
            'Account': row.account,
            'Group Name': row.groupName,
            'Credit Days': row.creditDays,
            'GST.No': row.gstNo,
            'PAN.No': row.panNo,
            'OP.Balance': row.opBalance,
            'Address': row.address,
            'Bank Account.No': row.bankAccountNo,
            'IFSC Code': row.ifscCode,
            'Status': row.status
        }));

        exportToExcel(data, 'Account Master', 'account-master.xlsx');
        setIsExportOpen(false);
    };

    const handleAddAccount = (newAccount) => {
        setTableData([newAccount, ...tableData]);
        setCurrentView('list');
    };

    const handleUpdateAccount = (updatedAccount) => {
        setTableData(tableData.map(row => row.vendorCode === updatedAccount.vendorCode ? updatedAccount : row));
        setCurrentView('list');
        setSelectedAccount(null);
    };

    const toggleStatus = (vendorCode, currentStatus, event) => {
        event.stopPropagation();
        setTableData(tableData.map(row => 
            row.vendorCode === vendorCode ? { ...row, status: currentStatus === 'Active' ? 'Inactive' : 'Active' } : row
        ));
        setDropdownIndex(null);
    };

    if (currentView === 'add') {
        return <AddAccount onBack={() => setCurrentView('list')} onAddAccount={handleAddAccount} />;
    }

    if (currentView === 'edit') {
        return <AddAccount onBack={() => { setCurrentView('list'); setSelectedAccount(null); }} initialData={selectedAccount} onUpdateAccount={handleUpdateAccount} />;
    }

    if (currentView === 'view') {
        return <ViewAccount initialData={selectedAccount} onBack={() => { setCurrentView('list'); setSelectedAccount(null); }} />;
    }

    return (
        <div className="flex flex-col font-['Plus_Jakarta_Sans'] w-full animate-in fade-in duration-500">
            {/* Top aligned Add Button */}
            <div className="flex justify-end mb-6">
                <button 
                    onClick={() => setCurrentView('add')}
                    className="w-full sm:w-auto px-6 h-[44px] bg-[#014A36] text-white rounded-[8px] text-[14px] font-bold hover:bg-[#013b2b] transition-all flex items-center justify-center gap-2 shadow-sm">
                    {t('modules:add_account')}
                </button>
            </div>

            {/* Main Content Box */}
            <div className="bg-white rounded-[12px] border border-[#E5E7EB] shadow-sm">

                {/* Search, Filter, Export Bar */}
                <div className="flex flex-col sm:flex-row items-center justify-between p-4 border-b border-[#E5E7EB] gap-4">
                    <div className="flex items-center gap-3 w-full sm:w-auto flex-1">
                        <div className="relative w-full sm:w-[320px]">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="text"
                                placeholder={t('common:search_anything')}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full h-[40px] bg-[#F9FAFB] border border-[#E5E7EB] rounded-[8px] pl-10 pr-4 text-[14px] text-[#111827] placeholder:text-[#9CA3AF] outline-none focus:border-[#014A36] transition-all"
                            />
                        </div>
                        <button onClick={() => setIsFilterOpen(true)} className="flex items-center gap-2 px-6 h-[40px] border border-[#E5E7EB] text-[#4B5563] rounded-[8px] text-[14px] font-medium hover:bg-gray-50 transition-colors bg-white">
                            <Filter size={18} className="text-gray-400" />
                            {t('common:filter')}
                        </button>
                    </div>

                    <div className="relative" ref={exportRef}>
                        <button 
                            onClick={() => setIsExportOpen(!isExportOpen)}
                            className={`flex items-center gap-2 px-6 h-[40px] border rounded-[8px] text-[14px] font-medium transition-all duration-200 bg-white
                                ${isExportOpen ? 'border-[#014A36] text-[#014A36] shadow-sm' : 'border-[#E5E7EB] text-[#4B5563] hover:bg-gray-50'}`}
                        >
                            <Download size={18} className={isExportOpen ? 'text-[#014A36]' : 'text-gray-400'} />
                            {t('common:export')}
                        </button>

                        {/* Export Dropdown */}
                        {isExportOpen && (
                            <div className="absolute top-full right-0 mt-2 w-[160px] bg-white border border-gray-100 rounded-[12px] shadow-[0_10px_30px_rgba(0,0,0,0.1)] z-[50] py-2 animate-in fade-in slide-in-from-top-2 duration-200">
                                <button
                                    onClick={handleExportPDF}
                                    className="w-full px-4 py-2.5 flex items-center gap-3 text-[14px] text-gray-700 hover:bg-[#F9FAFB] hover:text-[#014A36] transition-colors"
                                >
                                    <FileText size={18} className="text-red-500" />
                                    PDF
                                </button>
                                <button
                                    onClick={handleExportExcel}
                                    className="w-full px-4 py-2.5 flex items-center gap-3 text-[14px] text-gray-700 hover:bg-[#F9FAFB] hover:text-[#014A36] transition-colors"
                                >
                                    <FileSpreadsheet size={18} className="text-green-600" />
                                    Excel
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto custom-scrollbar relative min-h-[400px]">
                    <style>{`
                        .custom-scrollbar::-webkit-scrollbar {
                            height: 6px;
                        }
                        .custom-scrollbar::-webkit-scrollbar-track {
                            background: #E5E7EB;
                        }
                        .custom-scrollbar::-webkit-scrollbar-thumb {
                            background: #A7C0B8;
                            border-radius: 4px;
                        }
                        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                            background: #014A36;
                        }
                    `}</style>
                    <table className="w-full whitespace-nowrap text-left min-w-[1200px]">
                        <thead className="bg-[#F9FAFB] border-b border-[#E5E7EB] text-[13px] font-semibold text-[#6B7280]">
                            <tr>
                                <th className="px-6 py-4 whitespace-nowrap cursor-pointer hover:text-[#014A36] transition-colors group">
                                    <div className="flex items-center gap-2">{t('modules:vendor_code')} <ChevronsUpDown size={14} className="opacity-50 group-hover:opacity-100" /></div>
                                </th>
                                <th className="px-6 py-4 whitespace-nowrap cursor-pointer hover:text-[#014A36] transition-colors group">
                                    <div className="flex items-center gap-2">{t('modules:account')} <ChevronsUpDown size={14} className="opacity-50 group-hover:opacity-100" /></div>
                                </th>
                                <th className="px-6 py-4 whitespace-nowrap cursor-pointer hover:text-[#014A36] transition-colors group">
                                    <div className="flex items-center gap-2">{t('common:group')} <ChevronsUpDown size={14} className="opacity-50 group-hover:opacity-100" /></div>
                                </th>
                                <th className="px-6 py-4 whitespace-nowrap cursor-pointer hover:text-[#014A36] transition-colors group">
                                    <div className="flex items-center gap-2">{t('modules:credit_days')} <ChevronsUpDown size={14} className="opacity-50 group-hover:opacity-100" /></div>
                                </th>
                                <th className="px-6 py-4 whitespace-nowrap cursor-pointer hover:text-[#014A36] transition-colors group">
                                    <div className="flex items-center gap-2">{t('modules:gst_no')} <ChevronsUpDown size={14} className="opacity-50 group-hover:opacity-100" /></div>
                                </th>
                                <th className="px-6 py-4 whitespace-nowrap cursor-pointer hover:text-[#014A36] transition-colors group">
                                    <div className="flex items-center gap-2">{t('modules:pan_no')} <ChevronsUpDown size={14} className="opacity-50 group-hover:opacity-100" /></div>
                                </th>
                                <th className="px-6 py-4 whitespace-nowrap cursor-pointer hover:text-[#014A36] transition-colors group">
                                    <div className="flex items-center gap-2">{t('modules:op_balance')} <ChevronsUpDown size={14} className="opacity-50 group-hover:opacity-100" /></div>
                                </th>
                                <th className="px-6 py-4 whitespace-nowrap cursor-pointer hover:text-[#014A36] transition-colors group">
                                    <div className="flex items-center gap-2">{t('common:address')} <ChevronsUpDown size={14} className="opacity-50 group-hover:opacity-100" /></div>
                                </th>
                                <th className="px-6 py-4 whitespace-nowrap cursor-pointer hover:text-[#014A36] transition-colors group">
                                    <div className="flex items-center gap-2">{t('modules:bank_account_no')} <ChevronsUpDown size={14} className="opacity-50 group-hover:opacity-100" /></div>
                                </th>
                                <th className="px-6 py-4 whitespace-nowrap cursor-pointer hover:text-[#014A36] transition-colors group">
                                    <div className="flex items-center gap-2">{t('modules:ifsc_code')} <ChevronsUpDown size={14} className="opacity-50 group-hover:opacity-100" /></div>
                                </th>
                                <th className="px-6 py-4 whitespace-nowrap cursor-pointer hover:text-[#014A36] transition-colors group">
                                    <div className="flex items-center gap-2">{t('common:status')} <ChevronsUpDown size={14} className="opacity-50 group-hover:opacity-100" /></div>
                                </th>
                                <th className="px-6 py-4 whitespace-nowrap text-center">{t('common:action')}</th>
                            </tr>
                        </thead>
                        <tbody className="text-[14px] text-[#111827]">
                            {paginatedData.map((row, index) => (
                                <tr key={index} className="border-b border-[#E5E7EB] hover:bg-gray-50/50 transition-colors">
                                    <td className="px-6 py-4 font-medium">{row.vendorCode}</td>
                                    <td className="px-6 py-4">{row.account}</td>
                                    <td className="px-6 py-4">{row.groupName}</td>
                                    <td className="px-6 py-4">{row.creditDays}</td>
                                    <td className="px-6 py-4">{row.gstNo}</td>
                                    <td className="px-6 py-4">{row.panNo}</td>
                                    <td className="px-6 py-4">{row.opBalance}</td>
                                    <td className="px-6 py-4 truncate max-w-[200px]" title={row.address}>{row.address}</td>
                                    <td className="px-6 py-4">{row.bankAccountNo}</td>
                                    <td className="px-6 py-4">{row.ifscCode}</td>
                                    <td className="px-6 py-4">
                                        <span className={row.status === 'Active' ? 'text-[#014A36] font-medium' : 'text-gray-500'}>
                                            {row.status === 'Active' ? t('common:active') : t('common:inactive')}
                                        </span>
                                    </td>
                                    <td className={`px-6 py-4 text-center relative ${dropdownIndex === index ? 'z-50' : ''}`}>
                                        <button onClick={(e) => toggleDropdown(index, e)} className="p-1 hover:bg-gray-100 rounded-full transition-colors text-gray-500">
                                            <MoreVertical size={18} />
                                        </button>

                                        {dropdownIndex === index && (
                                            <div 
                                                ref={dropdownRef} 
                                                className={`absolute right-6 w-max min-w-[180px] bg-white border border-gray-100 rounded-[12px] shadow-[0_10px_30px_rgba(0,0,0,0.15)] z-[100] py-2 animate-in fade-in duration-200 text-left ${
                                                    index >= paginatedData.length - 2 && paginatedData.length > 2
                                                        ? 'bottom-[80%] mb-1 slide-in-from-bottom-2'
                                                        : 'top-[80%] mt-1 slide-in-from-top-2'
                                                }`}
                                            >
                                                <button 
                                                    onClick={(e) => { e.stopPropagation(); setSelectedAccount(row); setCurrentView('view'); setDropdownIndex(null); }} 
                                                    className="flex items-center gap-3 w-full px-4 py-2.5 text-[14px] font-medium text-gray-700 hover:bg-[#F9FAFB] hover:text-[#014A36] transition-colors whitespace-nowrap"
                                                >
                                                    <Eye size={16} />
                                                    {t('modules:view_account')}
                                                </button>
                                                <button 
                                                    onClick={(e) => { e.stopPropagation(); setSelectedAccount(row); setCurrentView('edit'); setDropdownIndex(null); }} 
                                                    className="flex items-center gap-3 w-full px-4 py-2.5 text-[14px] font-medium text-gray-700 hover:bg-[#F9FAFB] hover:text-[#014A36] transition-colors whitespace-nowrap"
                                                >
                                                    <Edit3 size={16} />
                                                    {t('modules:update_account')}
                                                </button>
                                                <button 
                                                    onClick={(e) => toggleStatus(row.vendorCode, row.status, e)} 
                                                    className="flex items-center gap-3 w-full px-4 py-2.5 text-[14px] font-medium text-gray-700 hover:bg-[#F9FAFB] hover:text-[#014A36] transition-colors whitespace-nowrap border-t border-gray-100"
                                                >
                                                    <CheckCircle2 size={16} className={row.status === 'Active' ? 'text-gray-500' : 'text-[#014A36]'} />
                                                    {row.status === 'Active' ? t('common:inactive') : t('common:active')}
                                                </button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-4 border-t border-[#E5E7EB] bg-white gap-4">
                    <div className="flex items-center gap-3 text-[14px] text-[#4B5563]">
                        <span>{t('common:show')}</span>
                        <div className="relative">
                            <select 
                                value={rowsPerPage}
                                onChange={(e) => {
                                    setRowsPerPage(Number(e.target.value));
                                    setCurrentPage(1);
                                }}
                                className="appearance-none border border-[#D1D5DB] rounded-[6px] pl-3 pr-8 py-1.5 outline-none bg-transparent hover:border-gray-400 focus:border-[#014A36] transition-colors cursor-pointer text-[#111827]"
                            >
                                <option value={5}>5</option>
                                <option value={10}>10</option>
                                <option value={20}>20</option>
                                <option value={50}>50</option>
                            </select>
                            <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400" />
                        </div>
                        <span>{t('common:per_page')}</span>
                    </div>

                    <div className="flex items-center gap-4 text-[14px]">
                        <span>{totalItems === 0 ? '0-0 of 0' : `${startIndex + 1}–${endIndex} of ${totalItems}`}</span>
                        <div className="flex items-center gap-1">
                            <button 
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                                className={`w-[32px] h-[32px] flex items-center justify-center rounded-[6px] transition-colors ${currentPage === 1 ? 'text-gray-300 cursor-not-allowed' : 'hover:bg-gray-100 text-[#4B5563]'}`}
                            >
                                <ArrowLeft size={16} />
                            </button>
                            {getVisiblePages().map(page => (
                                <button 
                                    key={page}
                                    onClick={() => setCurrentPage(page)}
                                    className={`w-[32px] h-[32px] flex items-center justify-center rounded-[6px] transition-colors ${currentPage === page ? 'bg-[#F3F4F6] text-[#111827] font-semibold' : 'hover:bg-gray-100 text-[#6B7280]'}`}
                                >
                                    {page}
                                </button>
                            ))}
                            <button 
                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                disabled={currentPage === totalPages}
                                className={`w-[32px] h-[32px] flex items-center justify-center rounded-[6px] transition-colors ${currentPage === totalPages ? 'text-gray-300 cursor-not-allowed' : 'hover:bg-gray-100 text-[#4B5563]'}`}
                            >
                                <ArrowRight size={16} />
                            </button>
                        </div>
                    </div>
                </div>

            </div>

            {isFilterOpen && (
                <div
                    className="fixed inset-0 z-[100] flex justify-end"
                >
                    {/* Overlay */}
                    <div
                        className="absolute inset-0 bg-black/50 transition-opacity"
                        onClick={() => setIsFilterOpen(false)}
                    />

                    {/* Drawer */}
                    <div className="relative w-[400px] max-w-full bg-white h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-300">
                        {/* Drawer Header */}
                        <div className="flex items-center justify-between p-6 pb-4">
                            <h2 className="text-[16px] font-bold text-[#111827] font-['Plus_Jakarta_Sans']">Apply Filters</h2>
                            <button onClick={() => setIsFilterOpen(false)} className="text-black hover:text-[#111827] transition-colors p-1 rounded-full hover:bg-gray-100">
                                <X size={20} strokeWidth={1.5} />
                            </button>
                        </div>

                        {/* Drawer Body */}
                        <div className="flex-1 overflow-y-auto px-6 py-2 space-y-6">
                            <div>
                                <label className="block text-[13px] font-medium text-[#374151] mb-2">{t('modules:gst_no')}</label>
                                <input
                                    type="text"
                                    name="gstNo"
                                    value={filterInputs.gstNo}
                                    onChange={handleFilterChange}
                                    className="w-full h-[46px] px-3 border border-[#D1D5DB] rounded-[6px] text-[14px] text-[#111827] outline-none focus:border-[#014A36] focus:ring-1 focus:ring-[#014A36]/20 transition-all placeholder:text-gray-400"
                                />
                            </div>
                            <div>
                                <label className="block text-[13px] font-medium text-[#374151] mb-2">PAN.No</label>
                                <input
                                    type="text"
                                    name="panNo"
                                    value={filterInputs.panNo}
                                    onChange={handleFilterChange}
                                    className="w-full h-[46px] px-3 border border-[#D1D5DB] rounded-[6px] text-[14px] text-[#111827] outline-none focus:border-[#014A36] focus:ring-1 focus:ring-[#014A36]/20 transition-all placeholder:text-gray-400"
                                />
                            </div>
                            <div className="relative">
                                <label className="block text-[13px] font-medium text-[#374151] mb-2">Group Name</label>
                                <select
                                    name="groupName"
                                    value={filterInputs.groupName}
                                    onChange={handleFilterChange}
                                    className="w-full h-[46px] px-3 pr-10 border border-[#D1D5DB] rounded-[6px] text-[14px] text-[#111827] outline-none focus:border-[#014A36] focus:ring-1 focus:ring-[#014A36]/20 transition-all appearance-none bg-white font-['Plus_Jakarta_Sans']"
                                >
                                    <option value="" disabled className="hidden"></option>
                                    <option value="Sundry Creditors">Sundry Creditors</option>
                                    <option value="Sundry Debtors">Sundry Debtors</option>
                                </select>
                                <ChevronDown size={18} className="absolute right-3 top-1/2 translate-y-[20%] pointer-events-none text-[#6B7280]" />
                            </div>
                            <div>
                                <label className="block text-[13px] font-medium text-[#374151] mb-2">Credit Days</label>
                                <input
                                    type="text"
                                    name="creditDays"
                                    value={filterInputs.creditDays}
                                    onChange={handleFilterChange}
                                    className="w-full h-[46px] px-3 border border-[#D1D5DB] rounded-[6px] text-[14px] text-[#111827] outline-none focus:border-[#014A36] focus:ring-1 focus:ring-[#014A36]/20 transition-all placeholder:text-gray-400"
                                />
                            </div>
                            <div className="relative">
                                <label className="block text-[13px] font-medium text-[#374151] mb-2">Status</label>
                                <select
                                    name="status"
                                    value={filterInputs.status}
                                    onChange={handleFilterChange}
                                    className="w-full h-[46px] px-3 pr-10 border border-[#D1D5DB] rounded-[6px] text-[14px] text-[#111827] outline-none focus:border-[#014A36] focus:ring-1 focus:ring-[#014A36]/20 transition-all appearance-none bg-white font-['Plus_Jakarta_Sans']"
                                >
                                    <option value="" disabled className="hidden"></option>
                                    <option value="Active">Active</option>
                                    <option value="InActive">InActive</option>
                                </select>
                                <ChevronDown size={18} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[#6B7280]" />
                            </div>
                        </div>

                        {/* Drawer Footer */}
                        <div className="p-6 border-t border-[#E5E7EB] flex items-center justify-between gap-4 bg-white mt-auto">
                            <button
                                onClick={clearFilters}
                                className="flex-1 h-[48px] bg-white border border-[#D1D5DB] text-[#374151] text-[14px] font-semibold rounded-[6px] hover:bg-gray-50 transition-colors"
                            >
                                Clear
                            </button>
                            <button
                                onClick={applyFilters}
                                className="flex-1 h-[48px] bg-[#014A36] text-white text-[14px] font-semibold rounded-[6px] hover:bg-[#013b2b] transition-colors"
                            >
                                Apply Filter
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AccountMaster;
