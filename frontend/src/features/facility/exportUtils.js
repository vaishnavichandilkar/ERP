import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export const exportToExcelFacility = (data, filename = 'Facility_Report') => {
    try {
        if (!data || data.length === 0) {
            return { success: false, message: 'No data available to export' };
        }

        const dateStr = new Date().toISOString().split('T')[0];
        const fileName = `${filename}_${dateStr}.xlsx`;

        // Format data properly as requested
        const formattedData = data.map(item => ({
            'Sr.': item.id,
            'Facility Name': item.name,
            'Location': item.location,
            'Total Production Machine': item.machines,
            'Status': item.status,
            'Created At': item.createdAt
        }));

        const worksheet = XLSX.utils.json_to_sheet(formattedData);

        // Auto sizing for columns
        const colWidths = [
            { wch: 5 },  // Sr.
            { wch: 20 }, // Facility Name
            { wch: 20 }, // Location
            { wch: 25 }, // Total Production Machine
            { wch: 12 }, // Status
            { wch: 18 }  // Created At
        ];
        worksheet['!cols'] = colWidths;

        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Facilities');

        XLSX.writeFile(workbook, fileName);
        return { success: true, message: 'Excel file exported successfully' };
    } catch (error) {
        console.error('Excel export failed:', error);
        return { success: false, message: 'Export failed. Please try again.' };
    }
};

export const exportToPdfFacility = (data, filename = 'Facility_Report') => {
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
        doc.text('Facility Report', 14, 22);

        // Add Date
        doc.setFontSize(11);
        doc.setTextColor(100);
        doc.text(`Date: ${dateStr}`, 14, 30);

        // Prepare table data
        const tableColumns = ["Sr.", "Facility Name", "Location", "Total Production Machine", "Status", "Created At"];
        const tableRows = data.map(item => [
            item.id,
            item.name,
            item.location,
            item.machines,
            item.status,
            item.createdAt
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
