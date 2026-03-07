import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

export const exportToPDF = (title, columns, data, filename, customDoc = null) => {
    const doc = customDoc || new jsPDF();

    if (title) {
        doc.setFontSize(20);
        doc.text(title, 14, 22);
    }

    autoTable(doc, {
        startY: 30,
        head: columns ? [columns] : undefined,
        body: data,
        theme: 'grid',
        headStyles: { fillColor: [1, 74, 54] },
        styles: { fontSize: 8 }
    });

    doc.save(filename);
};

export const exportToExcel = (data, sheetName, filename) => {
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, sheetName);
    XLSX.writeFile(wb, filename);
};
