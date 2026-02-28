import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export const exportToExcel = (data, filename = 'Inventory_Report') => {
    try {
        if (!data || data.length === 0) {
            return { success: false, message: 'No data available to export' };
        }

        const dateStr = new Date().toISOString().split('T')[0];
        const fileName = `${filename}_${dateStr}.xlsx`;

        // Format data properly as requested
        const formattedData = data.map(item => ({
            'Sr.': item.sr,
            'Barcode': item.barcode,
            'Product': item.product,
            'weight/items': item.weight,
            'Facility Name': item.facility,
            'Terminal': item.terminal,
            'Status': item.status,
            'Created At': item.created,
            'Out At': item.out
        }));

        const worksheet = XLSX.utils.json_to_sheet(formattedData);

        // Auto sizing for columns
        const colWidths = [
            { wch: 5 },  // Sr.
            { wch: 20 }, // Barcode
            { wch: 15 }, // Product
            { wch: 12 }, // weight/items
            { wch: 15 }, // Facility Name
            { wch: 10 }, // Terminal
            { wch: 12 }, // Status
            { wch: 18 }, // Created At
            { wch: 18 }  // Out At
        ];
        worksheet['!cols'] = colWidths;

        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Inventory');

        XLSX.writeFile(workbook, fileName);
        return { success: true, message: 'Excel file exported successfully' };
    } catch (error) {
        console.error('Excel export failed:', error);
        return { success: false, message: 'Export failed. Please try again.' };
    }
};

export const exportToPdf = (data, filename = 'Inventory_Report') => {
    try {
        if (!data || data.length === 0) {
            return { success: false, message: 'No data available to export' };
        }

        const dateStr = new Date().toISOString().split('T')[0];
        const fileName = `${filename}_${dateStr}.pdf`;

        // Create PDF in landscape
        const doc = new jsPDF('landscape');

        // Add Title
        doc.setFontSize(18);
        doc.text('Inventory Report', 14, 22);

        // Add Date
        doc.setFontSize(11);
        doc.setTextColor(100);
        doc.text(`Date: ${dateStr}`, 14, 30);

        // Prepare table data
        const tableColumns = ["Sr.", "Barcode", "Product", "weight/items", "Facility Name", "Terminal", "Status", "Created At", "Out At"];
        const tableRows = data.map(item => [
            item.sr,
            item.barcode,
            item.product,
            item.weight,
            item.facility,
            item.terminal,
            item.status,
            item.created,
            item.out
        ]);

        autoTable(doc, {
            head: [tableColumns],
            body: tableRows,
            startY: 40,
            theme: 'grid',
            styles: { fontSize: 9, cellPadding: 3 },
            headStyles: { fillColor: [249, 250, 251], textColor: [107, 114, 128], fontStyle: 'bold' },
            alternateRowStyles: { fillColor: [253, 253, 253] }
        });

        doc.save(fileName);
        return { success: true, message: 'PDF file exported successfully' };
    } catch (error) {
        console.error('PDF export failed:', error);
        return { success: false, message: 'Export failed. Please try again.' };
    }
};
